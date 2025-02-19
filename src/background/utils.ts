interface StorageChange {
  [key: string]: browser.storage.StorageChange;
}

export function onStorageChanged(
  areaName: string,
  key: string,
  cb: (value: any) => void
): (changes: StorageChange, area?: string) => void {
  return function (changes, area) {
    if (!area && key in changes) {
      return cb(changes[key]);
    }
    if (area === areaName && key in changes) {
      return cb(changes[key].newValue);
    }
  };
}

export function onLocalStorageChanged(
  key: string,
  cb: (value: any) => void
): (changes: StorageChange, area?: string) => void {
  return onStorageChanged("local", key, cb);
}

export function onSyncStorageChanged(
  key: string,
  cb: (value: any) => void
): (changes: StorageChange, area?: string) => void {
  return onStorageChanged("sync", key, cb);
}

export function onManagedStorageChanged(
  key: string,
  cb: (value: any) => void
): (changes: StorageChange, area?: string) => void {
  return onStorageChanged("managed", key, cb);
}
