# {project-name}

<!-- OSS metadata badge - rename repo link and set status in OSSMETADATA -->
<!-- [![OSS Lifecycle](https://img.shields.io/osslifecycle/honeycombio/{repo-name})](https://github.com/honeycombio/home/blob/main/honeycomb-oss-lifecycle-and-practices.md) -->

Honeycomb wrapper for [OpenTelemetry](https://opentelemetry.io) in the browser.

// TODO: happy badges of the OTel versions we are using

This package sets up OpenTelemetry for tracing, using our recommended practices, including:

* Useful fields about the browser situation
* Easy configuration to send to Honeycomb
* Basic sampler to control event volume
* Convenient packaging
* An informative debug mode, including links to traces in Honeycomb

// TODO: ask Phillip whether we must call this a distro instead of a wrapper. It's a wrapper.

## Why use this?

This wrapper is a little ahead of OpenTelemetry, so that you can get the recommended fields in before they're completely standardized.

This wrapper is at least as stable as OpenTelemetry, because it is backwards-compatible as we update it to the latest OpenTelemetry versions, semantic conventions, and recommended practices.

We test this library, with its combination of OpenTelemetry dependencies, so that you can be confident that upgrades will work.

This project provides a convenient distribution of all the code required to get traces from the browser. No package manager is required. (note: maybe not in alpha)

## Migration Practices

This wrapper can change faster than OpenTelemetry, and yet be more stable. This section describes how we do that.

### Versioning

Our version numbers are independent of the OpenTelemetry version numbers. Check the badge at the top of this README for the OpenTelemetry version this is based on.

When OpenTelemetry releases a new version of the packages this project depends on, we update this project to use them within a week.

When the OpenTelemetry API or SDK has a major version bump, this package will too. We also have major version bumps of our own.

### Code

If there is something we want to get into OpenTelemetry, or a PR that we wish were merged already, we can incorporate that code here in parallel to working to get it published upstream.

When that code is in place upstream, we remove it here, and release a new version. When there is no change to the inputs and outputs, nothing else is required.

### Fields

This project adds fields to the outgoing spans. We follow semantic convention when it exists.

For fields that aren't yet part of the semantic conventions, we give them a name. If those field names become stable with a different name, then:

1. We add the new name, and emit both for 6 months.
1. We mark the old name as deprecated in this documentation
1. We offer a configuration option to NOT emit both.
1. After that period, we add a configuration parameter to allow you to say, keep emitting that old field name.
1. A year after the semantic convention has been in place, we stop emitting the old field name at all. (at the next major version bump)

### Configuration

The configuration accepted by this wrapper is based on the options available in the OpenTelemetry libraries.

When an option is not available upstream, we give it a name. If that options becomes available upstream under a different name, we migrate to that.

1. We add the new name, and accept both for 6 months.
1. We mark the old name as deprecated in this documentation, and issue a warning in debug mode.
1. After this period, the old name will be ignored (at the next major version bump).

## Contributing

See [CONTRIBUTING.md]()

## Support

See [SUPPORT.md]()

## Code of Conduct

See [CODE_OF_CONDUCT.md]()
