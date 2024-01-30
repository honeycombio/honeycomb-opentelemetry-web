# UTILITY FUNCS

# Span names for a given scope
# Arguments: $1 - scope name
span_names_for() {
	spans_from_scope_named $1 | jq '.name'
}

# Attributes for a given scope
# Arguments: $1 - scope name
span_attributes_for() {
	spans_from_scope_named $1 | \
		jq ".attributes[]"
}

# All resource attributes
resource_attributes_received() {
	spans_received | jq ".resource.attributes[]?"
}

# Spans for a given scope
# Arguments: $1 - scope name
spans_from_scope_named() {
	spans_received | jq ".scopeSpans[] | select(.scope.name == \"$1\").spans[]"
}

# All spans received
spans_received() {
	jq ".resourceSpans[]?" ./collector/data.json
}

# ASSERTION HELPERS

# Fail and display details if the expected and actual values do not
# equal. Details include both values.
#
# Inspired by bats-assert * bats-support, but dramatically simplified
# Arguments:
# $1 - actual result
# $2 - expected result
assert_equal() {
	if [[ $1 != "$2" ]]; then
		{
			echo
			echo "-- 💥 values are not equal 💥 --"
			echo "expected : $2"
			echo "actual   : $1"
			echo "--"
			echo
		} >&2 # output error to STDERR
		return 1
	fi
}

# Fail and display details if the actual value is empty.
# Arguments: $1 - actual result
assert_not_empty() {
	EMPTY=(\"\")
	if [[ "$1" == "${EMPTY}" ]]; then
		{
			echo
			echo "-- 💥 value is empty 💥 --"
			echo "value : $1"
			echo "--"
			echo
		} >&2 # output error to STDERR
		return 1
	fi
}
