const { saveContact, getAllContacts, updateContactById, deleteContactById } = require('../utils/contactModel');
const { sendContactEmail } = require('../utils/emailService');

const createContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Name, email, phone and message are required.' });
  }

  const contactPayload = {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    subject: subject?.trim() || 'General Inquiry',
    message: message.trim(),
  };

  let savedContact;
  try {
    savedContact = await saveContact(contactPayload);
  } catch (error) {
    console.error('Contact save failed:', error);
    return res.status(500).json({ error: 'Unable to save contact message to the database.' });
  }

  try {
    const { previewUrl, usingTestAccount } = await sendContactEmail(savedContact);
    const responsePayload = {
      id: savedContact.id,
      message: 'Contact message received and confirmation email sent successfully.',
    };

    if (usingTestAccount && previewUrl) {
      responsePayload.previewUrl = previewUrl;
      responsePayload.notice = 'Mailer is using a test account because SMTP credentials are not configured. Use the preview URL to inspect the email.';
    }

    return res.status(201).json(responsePayload);
  } catch (error) {
    console.error('Contact email send failed:', error);
    return res.status(500).json({ error: 'Contact saved, but sending confirmation email failed.' });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.json({ contacts, total: contacts.length });
  } catch (error) {
    console.error('Fetch contacts failed:', error);
    res.status(500).json({ error: 'Unable to fetch contacts.' });
  }
};

const updateContact = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Name, email, phone and message are required.' });
  }

  try {
    const updated = await updateContactById(id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject?.trim() || 'General Inquiry',
      message: message.trim(),
    });
    if (!updated) {
      return res.status(404).json({ error: 'Contact not found.' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Update contact failed:', error);
    return res.status(500).json({ error: 'Unable to update contact.' });
  }
};

const removeContact = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await deleteContactById(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Contact not found.' });
    }
    return res.json({ success: true, message: 'Contact deleted successfully.' });
  } catch (error) {
    console.error('Delete contact failed:', error);
    return res.status(500).json({ error: 'Unable to delete contact.' });
  }
};

module.exports = { createContact, getContacts, updateContact, removeContact };
