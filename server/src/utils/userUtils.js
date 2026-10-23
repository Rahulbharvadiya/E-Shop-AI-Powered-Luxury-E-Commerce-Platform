/**
 * Shared user anonymization helper for GDPR / privacy compliance.
 * Anonymizes unique identifiers so the customer's personal data is expunged
 * and their email/phone can be reused for fresh registration if desired.
 */
export async function anonymizeUser(user) {
  const anonymizedId = user._id.toString().slice(-6);
  user.status = 'deleted';
  user.name = 'Anonymized Account';
  user.email = `deleted_${anonymizedId}_${Date.now()}@eshop.local`;
  user.phone = `deleted_${anonymizedId}_${Date.now()}`;
  user.username = `deleted_${anonymizedId}_${Date.now()}`;
  user.addresses = [];
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  return user;
}
