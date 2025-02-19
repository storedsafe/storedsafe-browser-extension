export type OnAreaChanged<T> = (newValues: T, oldValues: T) => void
export type OnStorageChanged = (
  changes: { [key: string]: browser.storage.StorageChange },
  areaName: string
) => void
