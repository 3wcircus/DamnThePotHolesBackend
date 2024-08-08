# DamnThePotHolesBackend

Node backend for recording pothole/hazard hits and presenting a web interface for viewing the location of pothole/hazard reports.

The Android application uses hit detection and then sends hit data to this backend server process.

This process will then serve up a front-end using EJS templates to map hits and the severities in real (enough) time.

Additionally, this version can provide a map view that cross-references pothole repair work requests that are available via the MEM city data API.

