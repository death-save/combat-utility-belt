Principles:
1. Centralise like data
2. Purify classes
3. Modularise classes
4. Remove redundant properties

Examples:
1. Settings module holds just the raw settings metadata
2. Butler module is the single source of truth for constants
3. Like units of functionality are grouped into modules
4. Properties like GADGET_NAME removed in favour of using the inherent class name
5. Worker classes simply work, they don't hold data