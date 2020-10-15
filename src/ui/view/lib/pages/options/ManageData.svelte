<script lang="ts">
  import { Duration, loading, messages, MessageType } from "../../../../stores";
  import {
    sessions,
    settings,
    sites,
    preferences,
    ignore,
  } from "../../../../stores/browserstorage";

  import Card from "../../layout/Card.svelte";

  function clearSessions() {
    loading.add(
      `Data.clear.sessions`,
      Promise.all(
        [...$sessions].map(([host, session]) =>
          sessions.logout(host, session.token)
        )
      ),
      {
        onError(error) {
          messages.add(error.message, MessageType.ERROR, Duration.SHORT);
        },
        onSuccess() {
          messages.add(
            "Cleared all sessions.",
            MessageType.INFO,
            Duration.SHORT
          );
        },
      }
    );
  }

  function clearSettings() {
    loading.add(`Data.clear.settings`, settings.clear(), {
      onError(error) {
        messages.add(error.message, MessageType.ERROR, Duration.SHORT);
      },
      onSuccess() {
        messages.add("Cleared all settings.", MessageType.INFO, Duration.SHORT);
      },
    });
  }

  function clearSites() {
    loading.add(`Data.clear.sites`, sites.clear(), {
      onError(error) {
        messages.add(error.message, MessageType.ERROR, Duration.SHORT);
      },
      onSuccess() {
        messages.add("Cleared all sites.", MessageType.INFO, Duration.SHORT);
      },
    });
  }

  function clearSitePreferences() {
    loading.add(
      `Data.clear.preferences.site`,
      preferences.clearSitePreferences(),
      {
        onError(error) {
          messages.add(error.message, MessageType.ERROR, Duration.SHORT);
        },
        onSuccess() {
          messages.add(
            "Cleared site preferences.",
            MessageType.INFO,
            Duration.SHORT
          );
        },
      }
    );
  }

  function clearAutoFillPreferences() {
    loading.add(
      `Data.clear.preferences.fill`,
      preferences.clearAutoFillPreferences(),
      {
        onError(error) {
          messages.add(error.message, MessageType.ERROR, Duration.SHORT);
        },
        onSuccess() {
          messages.add(
            "Cleared auto fill preferences.",
            MessageType.INFO,
            Duration.SHORT
          );
        },
      }
    );
  }

  function clearAllPreferences() {
    loading.add(`Data.clear.preferences.all`, preferences.clear(), {
      onError(error) {
        messages.add(error.message, MessageType.ERROR, Duration.SHORT);
      },
      onSuccess() {
        messages.add(
          "Cleared all preferences.",
          MessageType.INFO,
          Duration.SHORT
        );
      },
    });
  }

  function clearIgnore() {
    loading.add(`Data.clear.ignore`, ignore.clear(), {
      onError(error) {
        messages.add(error.message, MessageType.ERROR, Duration.SHORT);
      },
      onSuccess() {
        messages.add("Cleared ignore list.", MessageType.INFO, Duration.SHORT);
      },
    });
  }

  function clearAllData() {
    loading.add(
      `Data.clear.all`,
      Promise.all([
        browser.storage.local.clear(),
        browser.storage.sync.clear(),
      ]),
      {
        onError(error) {
          messages.add(error.message, MessageType.ERROR, Duration.SHORT);
        },
        onSuccess() {
          messages.add("Cleared all data", MessageType.INFO, Duration.SHORT);
        },
      }
    );
  }
</script>

<style>

</style>

<section class="grid">
  <Card>
    <h2>Sessions</h2>
    <button type="button" class="danger" on:click={clearSessions}>
      Clear
    </button>
  </Card>
  <Card>
    <h2>Settings</h2>
    <button type="button" class="danger" on:click={clearSettings}>
      Clear user settings
    </button>
  </Card>
  <Card>
    <h2>Sites</h2>
    <button type="button" class="danger" on:click={clearSites}>Clear</button>
  </Card>
  <Card>
    <h2>Preferences</h2>
    <button type="button" class="warning" on:click={clearSitePreferences}>
      Clear site preferences
    </button>
    <button type="button" class="warning" on:click={clearAutoFillPreferences}>
      Clear auto fill preferences
    </button>
    <button type="button" class="danger" on:click={clearAllPreferences}>
      Clear all
    </button>
  </Card>
  <Card>
    <h2>Ignore list</h2>
    <button type="button" class="danger" on:click={clearIgnore}>Clear</button>
  </Card>
  <button type="button" class="danger" on:click={clearAllData}>
    CLEAR ALL DATA
  </button>
</section>
