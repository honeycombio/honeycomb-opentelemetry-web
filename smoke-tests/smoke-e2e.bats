#!/usr/bin/env bats

load test_helpers/utilities

CONTAINER_NAME="app-hello-world-web"
DOCUMENT_LOAD_SCOPE="@opentelemetry/instrumentation-document-load"

setup_file() {
  echo "# 🚧" >&3
}
teardown_file() {
  cp collector/data.json collector/data-results/data-${CONTAINER_NAME}.json
}

# TESTS

@test "Agent includes service.name in resource attributes" {
  result=$(resource_attributes_received | jq "select(.key == \"service.name\").value.stringValue")
  assert_equal "$result" '"web-distro"'
}

@test "Agent includes Honeycomb distro version" {
  version=$(resource_attributes_received | jq "select(.key == \"honeycomb.distro.version\").value.stringValue")
  assert_not_empty "$version"
  runtime_version=$(resource_attributes_received | jq "select(.key == \"honeycomb.distro.runtime_version\").value.stringValue")
  assert_equal "$runtime_version" '"browser"'
}

@test "Agent includes browser attributes" {
  platform=$(resource_attributes_received | jq "select(.key == \"browser.platform\").value.stringValue")
  assert_not_empty "$platform"

  mobile=$(resource_attributes_received | jq "select(.key == \"browser.mobile\").value.boolValue")
  assert_equal "$mobile" 'false'

  language=$(resource_attributes_received | jq "select(.key == \"browser.language\").value.stringValue")
  assert_equal "$language" '"en-US"'
}

@test "Agent includes entry_page attributes" {
  url=$(resource_attributes_received | jq "select(.key == \"entry_page.url\").value.stringValue")
  assert_not_empty "$url"

  path=$(resource_attributes_received | jq "select(.key == \"entry_page.path\").value.boolValue")
  assert_not_empty "$path"

  hostname=$(resource_attributes_received | jq "select(.key == \"entry_page.hostname\").value.stringValue")
  assert_not_empty "$hostname"
}

@test "Auto instrumentation produces 4 document load spans" {
  result=$(span_names_for ${DOCUMENT_LOAD_SCOPE})
  assert_equal "$result" '"documentFetch"
"resourceFetch"
"documentLoad"'
}

@test "Auto instrumentation adds session.id attribute" {
	result=$(span_attributes_for ${DOCUMENT_LOAD_SCOPE} | jq "select(.key == \"session.id\").value.stringValue")
	assert_not_empty "$result"
}

@test "Agent includes SampleRate key on all spans" {
  result=$(span_attributes_for ${DOCUMENT_LOAD_SCOPE} | jq "select(.key == \"SampleRate\").value.intValue")
  assert_equal "$result" '"1"
"1"
"1"'
}
