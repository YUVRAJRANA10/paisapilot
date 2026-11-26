export function getUserDisplayName(user) {
  if (!user) return 'User'
  const emailPrefix = user.email ? user.email.split('@')[0] : ''

  if (user.name && user.name !== emailPrefix) {
    return user.name
  }
  if (user.user_metadata?.full_name && user.user_metadata.full_name !== emailPrefix) {
    return user.user_metadata.full_name
  }
  if (user.full_name && user.full_name !== emailPrefix) {
    return user.full_name
  }
  if (user.username && user.username !== emailPrefix) {
    return user.username
  }
  if (user.user_metadata?.username && user.user_metadata.username !== emailPrefix) {
    return user.user_metadata.username
  }
  if (user.name) return user.name
  if (user.user_metadata?.full_name) return user.user_metadata.full_name
  if (user.full_name) return user.full_name
  if (emailPrefix) return emailPrefix
  return 'User'
}
