const pool = require('../config/db');

const getAllEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, t.name as template_name 
       FROM events e 
       LEFT JOIN templates t ON e.template_id = t.id 
       WHERE e.user_id = $1 
       ORDER BY e.created_at DESC`,
      [req.user.id]
    );

    res.json({ events: result.rows });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT e.*, t.name as template_name, t.content as template_content 
       FROM events e 
       LEFT JOIN templates t ON e.template_id = t.id 
       WHERE e.id = $1 AND e.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { template_id, trigger_type, webhook_url, conditions } = req.body;

    // Verify template belongs to user
    const templateCheck = await pool.query(
      'SELECT id FROM templates WHERE id = $1 AND user_id = $2',
      [template_id, req.user.id]
    );

    if (templateCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const result = await pool.query(
      'INSERT INTO events (user_id, template_id, trigger_type, webhook_url, conditions) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, template_id, trigger_type, webhook_url || null, JSON.stringify(conditions || {})]
    );

    res.status(201).json({ event: result.rows[0] });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { template_id, trigger_type, webhook_url, conditions, is_active } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (template_id !== undefined) {
      updateFields.push(`template_id = $${paramCount++}`);
      values.push(template_id);
    }
    if (trigger_type !== undefined) {
      updateFields.push(`trigger_type = $${paramCount++}`);
      values.push(trigger_type);
    }
    if (webhook_url !== undefined) {
      updateFields.push(`webhook_url = $${paramCount++}`);
      values.push(webhook_url);
    }
    if (conditions !== undefined) {
      updateFields.push(`conditions = $${paramCount++}`);
      values.push(JSON.stringify(conditions));
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, req.user.id);

    const result = await pool.query(
      `UPDATE events SET ${updateFields.join(', ')} WHERE id = $${paramCount++} AND user_id = $${paramCount++} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const triggerEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { to_number, variables } = req.body;

    // Get event with template
    const eventResult = await pool.query(
      `SELECT e.*, t.content as template_content, t.variables as template_variables 
       FROM events e 
       JOIN templates t ON e.template_id = t.id 
       WHERE e.id = $1 AND e.user_id = $2 AND e.is_active = true`,
      [id, req.user.id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or inactive' });
    }

    const event = eventResult.rows[0];
    
    // This will be handled by the message service
    res.json({ 
      message: 'Event triggered successfully',
      event: event,
      to_number,
      variables
    });
  } catch (error) {
    console.error('Trigger event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  triggerEvent
};

