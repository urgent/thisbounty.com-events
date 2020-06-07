# thisbounty.com

![img](https://user-images.githubusercontent.com/1377758/81486044-1eb4de00-9220-11ea-9dd0-35d151056d01.png)

## Problem

Jobs

### Solution

Open market

Level playing field

Stick to the script

### How does it make money

Be the best worker on a level playing field

No boss, no owner

### How do I get paid

For big projects, open a joint checking account with clients at any online bank. Then open one of your own. Deposit payment to joint account, then transfer to your own account.

For small projects, start with a small budget. I can start work for free really sells.

For disagreements, chat with the community. Someone will help you. Everyone works together.

SOON: Automatic crypto payout on test pass/fail.

### Business objectives

Start with easy work, software implementation mostly.

End with advancing collective human knowledge.

### Features

Lives on your phone.

If it's good, it goes live.

Reverse projects with focus on division of labor.

### Lifebar

Project health

Hit when something on the project goes wrong

Usually hits happen happens when you haven't done it before

Heals when work processes are proven to be fixed and code is shipped

Grows with completed projects, reference code, open source contributions, and wins against competing process systems

At zero loose a life

Earn a life with risk management and incident response strategies

Loosing all lives remove process from site

Game over: "Restart the game" cameo with saved checkpoints, bringing process back to site.

Design Guidance: Environment changes project

### Moneybar

Stamina for power-ups

Hit when buying something for the project

With enough money, anyone can build anything, so we need a limit

Heals when funding is made available

Grows with completed projects, customers and earnings, and wins against competing process systems

At zero, nothing really happens, just can't buy anything until funded.

Can still work for free.

Design Guidance: Project changes environment

### User Level

Increases with greater market use of features built with process

Decreases with less market use of features built with process

No outage for users on process removal

Features eventually will need support

Users will go somewhere.

### Programmer Level

Increases with greater programmer use of process

Decreases with less programmer use of process

Outage for programmers on process removal

### App backing services:

Websocket server -> broadcasts to all users, ephemeral.
IndexDB -> Single user only, persistent.
Build process -> No users, high persistence, authority, existings users need page reload or websocket update.

### Gameplay

Damage occurs from oversights, for instance, did not know storybook needs extra config for static files + typescript. Usually from not doing it before.

Consensus:

- One user may send a change across websockets. For instance hurting a bounty.
- Other users may reverse it with consensus. For instance healing a bounty.

Symbols:

- Hurt: Bounce back bounty, red flash
- Heal: Heart floats from bounty
- Temp Lead: Blinking cursor
- \* on Temporary Lead -> Existing lead was moved from a bounty, instead of a new lead being created on the bounty.

IndexDB

- Click on new button -> Lead shows up on right with temporary ID
- Click on bounty -> Leads change on right. Scrollable.
- Click on card -> Lead action. Github issues, figma, local vscode, in app, for instance project storm board for the task. On bookmark, automated provisioning, launching a figma project or github repo.
- Click on view -> grid view, like sticker coupon cutout with animations to show live
- Click on search -> keyboard input. Indexed search, and also fun commands.
- Click on bomb -> changes the bounties. When button clicked, bomb turns to home. Click and click again for easter egg game.

Websocket

- Click on lead -> Card button shows up on bottom with suit and number. Bookmark in IndexDB
- Click on edit -> Move lead to bounty, repeat bookmark progress with star
- Click on help -> chat opens up like xfire halo chat, irc commands

### Closing Thoughts

- I don't want to work.
- I want to see what I want built.
- If someone else does the hard work, I don't care.
- I don't want to read either. Please use graphics.

### Developer Hurt Log

[https://news.ycombinator.com/edit?id=23223604]
Logged hurt events during development:

- Diez extract from Figma for SVG. Heal by exporting SVG from figma.

- Github Package Registry. Need setup to publish design guide.

- Design tokens not extracted by diez, for instance borders

- Diez compile to webpack build. Need to add to webpack externals to build.

- Storybook does not detect compiled diez module from Github package registry

- Event emitter instead of context or lifting up state to prevent rerenders

- Sass for storybook, needed preset

- diez integration into webpack for sass

- GPR support for Netlify

- Webpack html plugin instead of html template from Typescript, netlify build directory

- Diez remove lottie

- Typescript demo, need dev server

- Copy static files

- Diez source map errors, need exclude in config

- Need vs code debug

- Need tests, needed sourcemaps in webpack config

- Launch storybook and test and dev server on start dev

- Use functions to help with debugging instead of callbacks

- Need both js and css integration for diez. js for body background color. css for sass modules.

- Dat bundle size. 1.1 MB way too large.

### Coming Soon

- Automatic crypto payout on test pass/fail.
