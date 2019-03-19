# Addressing issues with the Tasks/Common directory

## Issue with common

* Breaks in common can affect lots of tasks, makes changes high risk.

* Bloat from common - task authors who import large files for small functions.

* Unclear ownership - when issues arise in common code, who is responsible for them.

## Possible solutions

Most of the following are partial solutions so multiple may be useful in conjunction.

### Kill common completely

Move any code in common into the appropriate tasks. Create seperate repositories/npm modules when appropriate

Analysis:

* No more problems with common

* Simplifies build process

* Big process change for any task owners who use common

### Assign ownership to each common folder

If an owner doesn't step up, kill the folder and move its contents into appropriate tasks. Use codeowners to enforce ownership

Analysis:

* Clear responsibility when something fails

* Relatively simple change

### Use WebPack during build

Analysis:

* Removes unused modules?

* More research needed

### Build out tools indicating change in task size during CI

Can warn or error if things get too big.

* Increases awareness/control of bloat

* Costly timewise
