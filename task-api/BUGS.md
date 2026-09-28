# Bug Report

### Bug 1: Pagination skipping the first page
I found this one in `src/services/taskService.js` inside the `getPaginated()` function. When testing the API, requesting page 1 with a limit of 10 was completely skipping the first 10 tasks. The math `const offset = page * limit` was evaluating to 10, so it started slicing the array at index 10 instead of 0. I fixed it by updating the calculation to `const offset = (page - 1) * limit;` so page 1 correctly grabs indexes 0 through 9.

### Bug 2: Accidentally overwriting user priority
This was also in `src/services/taskService.js`, specifically inside `completeTask()`. I noticed that whenever a task was marked as done, the function was silently hardcoding `priority: 'medium'` into the updated object. If a user completed a 'high' priority task, it would overwrite their original choice, which would definitely cause some weird UI changes on the frontend dashboard. I fixed it by just removing the `priority: 'medium'` line from the object spread so it only updates the status and completion timestamp, leaving the rest of the user's data alone.