#!/usr/bin/env bats

load test_helpers/utilities

CONTAINER_NAME="app-hello-world-web"
DOCUMENT_LOAD_SCOPE="@opentelemetry/instrumentation-document-load"
USER_INTERACTION_SCOPE="@opentelemetry/instrumentation-user-interaction"
WEB_VITALS_SCOPE="@honeycombio/instrumentation-web-vitals"

CUSTOM_TRACER_NAME="click-tracer"

setup_file() {
  echo "# 🚧 preparing test" >&3
}
teardown_file() {
  cp collector/data.json collector/data-results/data-${CONTAINER_NAME}.json
}

## mostly automatic tests first ##

@test "SDK telemetry includes service.name in resource attributes" {
  result=$(resource_attributes_received | jq "select(.key == \"service.name\").value.stringValue")
  assert_equal "$result" '"web-distro"'
}

@test "SDK telemetry includes Honeycomb distro version" {
  version=$(resource_attributes_received | jq "select(.key == \"honeycomb.distro.version\").value.stringValue")
  assert_not_empty "$version"
  runtime_version=$(resource_attributes_received | jq "select(.key == \"honeycomb.distro.runtime_version\").value.stringValue")
  assert_equal "$runtime_version" '"browser"'
}

@test "SDK telemetry includes browser attributes" {
  platform=$(resource_attributes_received | jq "select(.key == \"browser.platform\").value.stringValue")
  assert_not_empty "$platform"

  mobile=$(resource_attributes_received | jq "select(.key == \"browser.mobile\").value.boolValue")
  assert_equal "$mobile" 'false'

  language=$(resource_attributes_received | jq "select(.key == \"browser.language\").value.stringValue")
  assert_equal "$language" '"en-US"'
}

@test "SDK telemetry includes entry_page attributes" {
  url=$(resource_attributes_received | jq "select(.key == \"entry_page.url\").value.stringValue")
  assert_not_empty "$url"

  path=$(resource_attributes_received | jq "select(.key == \"entry_page.path\").value.boolValue")
  assert_not_empty "$path"

  hostname=$(resource_attributes_received | jq "select(.key == \"entry_page.hostname\").value.stringValue")
  assert_not_empty "$hostname"
}

@test "SDK telemetry includes SampleRate key on spans" {
  result=$(span_attributes_for ${DOCUMENT_LOAD_SCOPE} | jq "select(.key == \"SampleRate\").value.intValue")
  assert_equal "$result" '"1"
"1"
"1"
"1"'
}

@test "Auto instrumentation produces user interaction click span" {
  result=$(span_names_for ${USER_INTERACTION_SCOPE})
  assert_equal "$result" '"click"'
}
@test "Auto instrumentation produces 4 document load spans" {
  result=$(span_names_for ${DOCUMENT_LOAD_SCOPE})
  assert_equal "$result" '"documentFetch"
"resourceFetch"
"resourceFetch"
"documentLoad"'
}

@test "Auto instrumentation adds session.id attribute" {
	result=$(span_attributes_for ${DOCUMENT_LOAD_SCOPE} | jq "select(.key == \"session.id\").value.stringValue")
	assert_not_empty "$result"
}

## tests on custom instrumentation ##

@test "SDK telemetry includes custom resource attributes" {
  result=$(resource_attributes_received | jq "select(.key == \"app.environment\").value.stringValue")
  assert_equal "$result" '"development"'
}

@test "Custom instrumentation produces spans with custom names" {
  result=$(span_names_for ${CUSTOM_TRACER_NAME})
  assert_equal "$result" '"calculating stuff"
"did a thing"
"clicked the button"'
}

@test "Custom instrumentation adds custom attribute" {
	result=$(span_attributes_for ${CUSTOM_TRACER_NAME} | jq "select(.key == \"message\").value.stringValue")
	assert_contains "$result" '"important message"'
}

@test "BaggageSpanProcessor: key-values added to baggage appear on child spans" {
	result=$(span_attributes_for ${CUSTOM_TRACER_NAME} | jq "select(.key == \"username\").value.stringValue")
	assert_contains "$result" '"alice"
"alice"'
}

@test "Auto instrumentation produces web vitals spans" {
  result=$(span_names_for ${WEB_VITALS_SCOPE})
  assert_not_empty "$result"
}
