require 'storedsafe/mockserver'

StoredSafe::MockServer.create_server do |config|
  config.username='user'
  config.passphrase='pass'
  config.otp='otp'
end
