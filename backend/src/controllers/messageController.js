const pool = require('../config/db');
const whatsappService = require('../services/whatsapp');

const sendMessage = async (req, res) => {
  try {
    const { template_id, to_number, variables } = req.body;

    // Get template
    const templateResult = await pool.query(
      'SELECT * FROM templates WHERE id = $1 AND user_id = $2',
      [template_id, req.user.id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];

    // Get user's WhatsApp account
    const accountResult = await pool.query(
      'SELECT * FROM whatsapp_accounts WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    if (accountResult.rows.length === 0) {
      return res.status(400).json({ error: 'WhatsApp account not configured' });
    }

    const account = accountResult.rows[0];

    // Replace variables in template
    const messageContent = whatsappService.replaceVariables(
      { content: template.content, variables: template.variables },
      variables || {}
    );

    // Send message via WhatsApp API
    const sendResult = await whatsappService.sendMessage(
      account.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID,
      account.access_token || process.env.WHATSAPP_ACCESS_TOKEN,
      to_number,
      messageContent
    );

    // Log message
    const logResult = await pool.query(
      `INSERT INTO message_logs 
       (user_id, template_id, to_number, message_id, status, error_message, sent_at) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [
        req.user.id,
        template_id,
        to_number,
        sendResult.messageId || null,
        sendResult.success ? 'sent' : 'failed',
        sendResult.error || null
      ]
    );

    if (sendResult.success) {
      res.json({
        message: 'Message sent successfully',
        messageId: sendResult.messageId,
        log: logResult.rows[0]
      });
    } else {
      res.status(400).json({
        error: 'Failed to send message',
        details: sendResult.error,
        log: logResult.rows[0]
      });
    }
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMessageLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT ml.*, t.name as template_name FROM message_logs ml LEFT JOIN templates t ON ml.template_id = t.id WHERE ml.user_id = $1';
    const params = [req.user.id];
    let paramCount = 2;

    if (status) {
      query += ` AND ml.status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY ml.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM message_logs WHERE user_id = $1' + (status ? ' AND status = $2' : ''),
      status ? [req.user.id, status] : [req.user.id]
    );

    res.json({
      logs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get message logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [req.user.id];
    if (start_date && end_date) {
      dateFilter = ' AND created_at BETWEEN $2 AND $3';
      params.push(start_date, end_date);
    }

    // Total messages
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM message_logs WHERE user_id = $1${dateFilter}`,
      params
    );

    // Messages by status
    const statusResult = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM message_logs 
       WHERE user_id = $1${dateFilter}
       GROUP BY status`,
      params
    );

    // Messages by day
    const dailyResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM message_logs 
       WHERE user_id = $1${dateFilter}
       GROUP BY DATE(created_at) 
       ORDER BY date DESC 
       LIMIT 30`,
      params
    );

    // Top templates
    const templateResult = await pool.query(
      `SELECT t.name, COUNT(ml.id) as count 
       FROM message_logs ml 
       JOIN templates t ON ml.template_id = t.id 
       WHERE ml.user_id = $1${dateFilter}
       GROUP BY t.id, t.name 
       ORDER BY count DESC 
       LIMIT 10`,
      params
    );

    res.json({
      total: parseInt(totalResult.rows[0].total),
      byStatus: statusResult.rows,
      daily: dailyResult.rows,
      topTemplates: templateResult.rows
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sendMessage,
  getMessageLogs,
  getAnalytics
};

