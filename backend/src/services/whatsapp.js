const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  }

  /**
   * Replace template variables with actual values
   */
  replaceVariables(template, variables = {}) {
    let content = template.content;
    const templateVars = template.variables || [];
    
    templateVars.forEach(varName => {
      const value = variables[varName] || `{{${varName}}}`;
      content = content.replace(new RegExp(`{{${varName}}}`, 'g'), value);
    });

    return content;
  }

  /**
   * Send WhatsApp message using Cloud API
   */
  async sendMessage(phoneNumberId, accessToken, to, messageText) {
    try {
      const url = `${this.apiUrl}/${phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/[^0-9]/g, ''), // Remove non-numeric characters
        type: 'text',
        text: {
          body: messageText
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Send template message (for approved templates)
   */
  async sendTemplateMessage(phoneNumberId, accessToken, to, templateName, languageCode = 'en', components = []) {
    try {
      const url = `${this.apiUrl}/${phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to.replace(/[^0-9]/g, ''),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('WhatsApp Template API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Verify webhook (for WhatsApp webhook setup)
   */
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return challenge;
    }
    return null;
  }

  /**
   * Process webhook event
   */
  processWebhookEvent(event) {
    // Handle incoming WhatsApp webhook events
    // This processes status updates, incoming messages, etc.
    return {
      type: event.entry?.[0]?.changes?.[0]?.value?.statuses ? 'status' : 'message',
      data: event
    };
  }
}

module.exports = new WhatsAppService();

