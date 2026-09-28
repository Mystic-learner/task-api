# Submission Notes

#### What I'd test next if I had more time
I'd probably throw some weird, super-long strings at the title and description fields just to see what happens. As a frontend dev, I always worry about massive text inputs completely breaking the UI cards or React components when we fetch the data, so I'd want to catch that on the server side first.

#### Anything that surprised me in the codebase
Honestly, the hardcoded priority bug inside `completeTask` threw me off for a second. I didn't expect the function to just quietly overwrite the user's priority to 'medium' whenever they marked a task as done. It was a good reminder of how easily data can mutate if you aren't careful with object spreading.

#### Any questions I'd ask before shipping this to production
1. Are we hooking this up to a real database soon? Since it's just an in-memory array right now, it wipes all the data every time the server restarts. 
2. Since I usually focus on the frontend, I'd want to know exactly how the design team plans to display the new `assignee` field. I want to make sure the way I structured this API payload actually matches the props our React components are expecting to receive.