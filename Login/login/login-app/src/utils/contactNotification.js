const LAST_SEEN_CONTACT_ID_KEY = 'dorunning_last_seen_contact_id';

export const getLastSeenContactId = () => {
  const raw = localStorage.getItem(LAST_SEEN_CONTACT_ID_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export const getUnreadContactCount = (contacts = []) => {
  if (!Array.isArray(contacts) || contacts.length === 0) return 0;
  const lastSeenId = getLastSeenContactId();
  return contacts.filter((c) => Number(c?.id) > lastSeenId).length;
};

export const markContactsAsSeen = (contacts = []) => {
  if (!Array.isArray(contacts) || contacts.length === 0) return;
  const maxId = contacts.reduce((max, c) => {
    const id = Number(c?.id) || 0;
    return id > max ? id : max;
  }, getLastSeenContactId());

  if (maxId > 0) {
    localStorage.setItem(LAST_SEEN_CONTACT_ID_KEY, String(maxId));
    window.dispatchEvent(new Event('contacts-seen'));
  }
};
