<script lang="ts">
  import { getMessage, LocalizedMessage } from "@/global/i18n";

  import { Duration, loading, messages, MessageType } from "@/ui/stores";
  import {
    sessions,
    settings,
    sites,
    preferences,
    ignoreURLs,
  } from "@/ui/stores/browserstorage";

  import Card from "@/ui/view/lib/layout/Card.svelte";
  import Checkbox from "@/ui/view/lib/layout/Checkbox.svelte";
  import Dropdown from "@/ui/view/lib/layout/Dropdown.svelte";
  import RecursiveList from "./RecursiveList.svelte";

  interface DataSource {
    title: string;
    method: () => Promise<any>;
    description?: string;
    children?: Record<string, DataSource>;
  }

  let dataSourceList: Record<string, DataSource>;
  $: dataSourceList = {
    all: {
      title: "All",
      method: () =>
        Promise.all([
          browser.storage.local.clear(),
          browser.storage.sync.clear(),
        ]),
      children: {
        sessions: {
          title: "Sessions",
          method: () =>
            Promise.all(
              [...sessions.data].map(([host, session]) =>
                sessions.logout(host, session.token)
              )
            ),
          description:
            sessions.data.size === 0
              ? ""
              : "<b>" + sessions.data.size + "</b> active sessions",
        },
        settings: {
          title: "Settings",
          method: settings.clear,
          description: [...settings.data]
            .map(([key, { value, managed }]) =>
              managed ? "" : `${key}: <b>${value}</b>`
            )
            .filter((v) => v !== "")
            .join("<br/>"),
        },
        sites: {
          title: "Sites",
          method: sites.clear,
          description: sites.data
            .map(({ host, apikey, managed }) =>
              managed ? "" : `${host}: apikey <b>${apikey}</b>`
            )
            .filter((v) => v !== "")
            .join("<br>"),
        },
        preferences: {
          title: "Preferences",
          method: preferences.clear,
          children: {
            addPreferences: {
              title: "Add Preferences",
              method: preferences.clearAddPreferences,
              description:
                (preferences.data.add?.host
                  ? "Host preference: <b>" +
                    preferences.data.add.host +
                    "</b><br/>"
                  : "") +
                (preferences.data.add?.vaults
                  ? Object.keys(preferences.data.add?.vaults)
                      .map(
                        (key) =>
                          `${key}: Vault <b>` +
                          preferences.data.add?.vaults[key] +
                          "</b>"
                      )
                      .join("<br/>")
                  : ""),
            },
            sitePreferences: {
              title: "Site Preferences",
              method: preferences.clearSitePreferences,
              description: [...(preferences.data.sites ?? [])]
                .map(
                  ([key, { username, loginType }]) =>
                    `${key}: <b>${username}</b> <b>${loginType}</b>`
                )
                .join("<br/>"),
            },
            autoFillPreferences: {
              title: "Auto Fill Preferences",
              method: preferences.clearAutoFillPreferences,
              description: [...(preferences.data.autoFill ?? [])]
                .map(
                  ([key, { host, objectId }]) =>
                    `${host}: ${key} <b>${objectId}</b>`
                )
                .join("<br/>"),
            },
          },
        },
        ignore: {
          title: "Ignore",
          method: ignoreURLs.clear,
          description:
            ignoreURLs.data.length === 0
              ? ""
              : "<b>" + ignoreURLs.data.length + "</b> sites ignored",
        },
      },
    },
  };

  let checked: Record<string, boolean> = {};

  function onChange(e: Event, obj: Record<string, DataSource>) {
    checked = {
      ...checked,
      ...getCascadeState((e.target as HTMLInputElement).checked, obj),
    };
    checked = {
      ...checked,
      ...getBubbledState(),
    };
  }

  function getBubbledState(
    obj: Record<string, DataSource> = dataSourceList
  ): Record<string, boolean> {
    let newChecked = {};
    if (obj && Object.keys(obj).length > 0) {
      Object.keys(obj).forEach((key) => {
        const children = obj[key].children;
        if (!!children && Object.keys(children).length > 0) {
          const keyChecked =
            Object.keys(children).reduce(
              (acc, key) => checked[key] && acc,
              true
            ) ?? false;
          newChecked = {
            ...newChecked,
            ...getBubbledState(children),
            [key]: keyChecked,
          };
        }
      });
    }
    return newChecked;
  }

  function getCascadeState(value: boolean, obj: Record<string, DataSource>) {
    let newChecked = {};
    if (obj && Object.keys(obj).length > 0) {
      Object.keys(obj).forEach((key) => {
        const children = obj[key].children ?? {};
        newChecked = {
          ...newChecked,
          ...getCascadeState(value, children),
          [key]: value,
        };
      });
    }
    return newChecked;
  }

  /**
   * Set all checkboxes in the provided structure to the same value.
   * @param value true/false for checked/unchecked.
   * @param obj The data sources that should be set.
   */
  function setAll(
    value: boolean,
    obj: Record<string, DataSource> = dataSourceList
  ) {
    checked = Object.fromEntries(Object.keys(obj).map((key) => [key, value]));
  }

  function clearChecked(source: Record<string, DataSource> = dataSourceList) {
    Object.keys(source).forEach((key) => {
      if (checked[key]) {
        loading.add(`Data.clear.${key}`, source[key].method(), {
          onError(error) {
            messages.add(error.message, MessageType.ERROR, Duration.SHORT);
          },
          onSuccess() {
            messages.add(
              `${source[key].title} successfully cleared`,
              MessageType.INFO,
              Duration.SHORT
            );
            setAll(false, dataSourceList);
          },
        });
      } else {
        const children = source[key].children;
        if (!!children) clearChecked(children);
      }
    });
  }
</script>

<section class="grid">
  <Card>
    <RecursiveList items={dataSourceList} let:key let:item>
      <Dropdown showing={false} enabled={!!item.description}>
        {#snippet title()}
          <label for={key}>
            <Checkbox
              id={key}
              bind:checked={checked[key]}
              on:change={(e) => onChange(e, item.children)}
            />
            <h2>{item.title}</h2>
          </label>
        {/snippet}
        {#snippet content()}
          <div>
            {#if item.description}
              <p class="description">{@html item.description}</p>
            {/if}
          </div>
        {/snippet}
      </Dropdown>
    </RecursiveList>
  </Card>
  <div class="sticky-buttons">
    <button
      type="button"
      class="danger"
      on:click|preventDefault={() => clearChecked()}
    >
      {getMessage(LocalizedMessage.CLEAR_DATA)}
    </button>
  </div>
</section>

<style>
  label {
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: var(--spacing);
    cursor: pointer;
  }

  .description {
    padding-left: 1em;
    pointer-events: none;
  }
</style>
