import pool from '../config/database.js';

class DashboardController {
  // Get daily bookings for the last 30 days
  static async getDailyBookings(req, res) {
    try {
      const query = `
        SELECT 
          appointment_date as date,
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
        FROM appointments 
        WHERE appointment_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY appointment_date 
        ORDER BY appointment_date DESC
      `;
      
      const result = await pool.query(query);
      
      res.json({
        success: true,
        data: result.rows,
        summary: {
          total_days: result.rows.length,
          total_bookings: result.rows.reduce((sum, day) => sum + parseInt(day.total_bookings), 0)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get hourly revenue for today
  static async getHourlyRevenue(req, res) {
    try {
      const query = `
        SELECT 
          EXTRACT(HOUR FROM p.payment_date) as hour,
          SUM(p.amount) as revenue,
          COUNT(p.id) as transaction_count
        FROM payments p
        WHERE DATE(p.payment_date) = CURRENT_DATE 
          AND p.payment_status = 'completed'
        GROUP BY EXTRACT(HOUR FROM p.payment_date)
        ORDER BY hour
      `;
      
      const result = await pool.query(query);
      
      // Fill missing hours with 0 revenue
      const hourlyData = Array.from({length: 24}, (_, i) => ({
        hour: i,
        revenue: '0.00',
        transaction_count: '0'
      }));
      
      result.rows.forEach(row => {
        hourlyData[row.hour] = {
          hour: parseInt(row.hour),
          revenue: parseFloat(row.revenue).toFixed(2),
          transaction_count: parseInt(row.transaction_count)
        };
      });
      
      res.json({
        success: true,
        data: hourlyData,
        summary: {
          total_revenue: hourlyData.reduce((sum, hour) => sum + parseFloat(hour.revenue), 0).toFixed(2),
          peak_hour: hourlyData.reduce((max, hour) => 
            parseFloat(hour.revenue) > parseFloat(max.revenue) ? hour : max
          )
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get comprehensive dashboard metrics
  static async getDashboardMetrics(req, res) {
    try {
      const queries = {
        todayBookings: `
          SELECT COUNT(*) as count 
          FROM appointments 
          WHERE appointment_date = CURRENT_DATE
        `,
        todayRevenue: `
          SELECT COALESCE(SUM(amount), 0) as revenue 
          FROM payments 
          WHERE DATE(payment_date) = CURRENT_DATE 
            AND payment_status = 'completed'
        `,
        monthlyBookings: `
          SELECT COUNT(*) as count 
          FROM appointments 
          WHERE appointment_date >= DATE_TRUNC('month', CURRENT_DATE)
        `,
        monthlyRevenue: `
          SELECT COALESCE(SUM(amount), 0) as revenue 
          FROM payments 
          WHERE payment_date >= DATE_TRUNC('month', CURRENT_DATE)
            AND payment_status = 'completed'
        `,
        topDoctors: `
          SELECT 
            u.name,
            COUNT(a.id) as appointment_count,
            COALESCE(SUM(p.amount), 0) as revenue
          FROM users u
          LEFT JOIN appointments a ON u.id = a.doctor_id
          LEFT JOIN payments p ON a.id = p.appointment_id AND p.payment_status = 'completed'
          WHERE u.role = 'Doctor'
            AND a.appointment_date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY u.id, u.name
          ORDER BY appointment_count DESC
          LIMIT 5
        `
      };

      const results = await Promise.all([
        pool.query(queries.todayBookings),
        pool.query(queries.todayRevenue),
        pool.query(queries.monthlyBookings),
        pool.query(queries.monthlyRevenue),
        pool.query(queries.topDoctors)
      ]);

      res.json({
        success: true,
        data: {
          today: {
            bookings: parseInt(results[0].rows[0].count),
            revenue: parseFloat(results[1].rows[0].revenue).toFixed(2)
          },
          monthly: {
            bookings: parseInt(results[2].rows[0].count),
            revenue: parseFloat(results[3].rows[0].revenue).toFixed(2)
          },
          top_doctors: results[4].rows.map(row => ({
            name: row.name,
            appointments: parseInt(row.appointment_count),
            revenue: parseFloat(row.revenue).toFixed(2)
          }))
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get revenue trends (daily for last 7 days)
  static async getRevenueTrends(req, res) {
    try {
      const query = `
        SELECT 
          DATE(p.payment_date) as date,
          SUM(p.amount) as daily_revenue,
          COUNT(p.id) as transaction_count,
          AVG(p.amount) as avg_transaction
        FROM payments p
        WHERE p.payment_date >= CURRENT_DATE - INTERVAL '7 days'
          AND p.payment_status = 'completed'
        GROUP BY DATE(p.payment_date)
        ORDER BY date DESC
      `;
      
      const result = await pool.query(query);
      
      res.json({
        success: true,
        data: result.rows.map(row => ({
          date: row.date,
          revenue: parseFloat(row.daily_revenue).toFixed(2),
          transactions: parseInt(row.transaction_count),
          avg_transaction: parseFloat(row.avg_transaction).toFixed(2)
        })),
        summary: {
          total_revenue: result.rows.reduce((sum, day) => sum + parseFloat(day.daily_revenue), 0).toFixed(2),
          total_transactions: result.rows.reduce((sum, day) => sum + parseInt(day.transaction_count), 0)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default DashboardController;