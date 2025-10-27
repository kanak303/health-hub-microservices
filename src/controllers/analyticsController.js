import pool from '../config/database.js';

class AnalyticsController {
  // Get booking patterns by day of week
  static async getBookingPatterns(req, res) {
    try {
      const query = `
        SELECT 
          EXTRACT(DOW FROM appointment_date) as day_of_week,
          TO_CHAR(appointment_date, 'Day') as day_name,
          COUNT(*) as booking_count,
          AVG(fee) as avg_fee
        FROM appointments 
        WHERE appointment_date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY EXTRACT(DOW FROM appointment_date), TO_CHAR(appointment_date, 'Day')
        ORDER BY day_of_week
      `;
      
      const result = await pool.query(query);
      
      res.json({
        success: true,
        data: result.rows.map(row => ({
          day_of_week: parseInt(row.day_of_week),
          day_name: row.day_name.trim(),
          bookings: parseInt(row.booking_count),
          avg_fee: parseFloat(row.avg_fee).toFixed(2)
        }))
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get revenue by payment method
  static async getRevenueByPaymentMethod(req, res) {
    try {
      const query = `
        SELECT 
          payment_method,
          COUNT(*) as transaction_count,
          SUM(amount) as total_revenue,
          AVG(amount) as avg_amount
        FROM payments 
        WHERE payment_status = 'completed'
          AND payment_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY payment_method
        ORDER BY total_revenue DESC
      `;
      
      const result = await pool.query(query);
      
      res.json({
        success: true,
        data: result.rows.map(row => ({
          method: row.payment_method,
          transactions: parseInt(row.transaction_count),
          revenue: parseFloat(row.total_revenue).toFixed(2),
          avg_amount: parseFloat(row.avg_amount).toFixed(2)
        }))
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get clinic performance comparison
  static async getClinicPerformance(req, res) {
    try {
      const query = `
        SELECT 
          c.name as clinic_name,
          COUNT(a.id) as total_appointments,
          COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
          COALESCE(SUM(p.amount), 0) as total_revenue,
          ROUND(
            COUNT(CASE WHEN a.status = 'completed' THEN 1 END)::numeric / 
            NULLIF(COUNT(a.id), 0) * 100, 2
          ) as completion_rate
        FROM clinics c
        LEFT JOIN appointments a ON c.id = a.clinic_id 
          AND a.appointment_date >= CURRENT_DATE - INTERVAL '30 days'
        LEFT JOIN payments p ON a.id = p.appointment_id 
          AND p.payment_status = 'completed'
        GROUP BY c.id, c.name
        ORDER BY total_revenue DESC
      `;
      
      const result = await pool.query(query);
      
      res.json({
        success: true,
        data: result.rows.map(row => ({
          clinic: row.clinic_name,
          appointments: parseInt(row.total_appointments),
          completed: parseInt(row.completed_appointments),
          revenue: parseFloat(row.total_revenue).toFixed(2),
          completion_rate: parseFloat(row.completion_rate || 0).toFixed(2)
        }))
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default AnalyticsController;