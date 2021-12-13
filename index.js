const tmi = require('tmi.js');
const colors = require('colors');
const bot = require('./bot.json');
const commands = bot['enabledModules']['commands'];

const color = {
    "black": colors.black,
    "blue": colors.blue,
    "cyan": colors.cyan,
    "gray": colors.gray,
    "grey": colors.grey,
    "white": colors.white,
    "cyan": colors.magenta,
    "yellow": colors.yellow,
    "green": colors.green,
    "red": colors.red,
    "rainbow": colors.rainbow,
    "zebra": colors.zebra,
    "trap": colors.trap,
    "random": colors.random,
    "america": colors.america
};

const style = {
    "bold": colors.bold,
    "underline": colors.underline,
    "dim": colors.dim,
    "italic": colors.italic,
    "inverse": colors.inverse,
    "hidden": colors.hidden,
    "strikethrough": colors.strikethrough,
    "zalgo": colors.zalgo
}

const client = tmi.Client({
    options: { debug: bot['enabledModules']['debug'] === true ? bot['enabledModules']['debug'] : false },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: bot['login_username'],
        password: bot['login_password']
    },
    channels: bot['channels']
});

client.on('chat', async (channel, userState, message, self) => {
    if(bot['enabledModules']['chatLog'] === true) {
        await console.log(`[${colors.blue(userState.username)} @ ${colors.red(new Date(Date.now()).toString())}] ${message}`);
    }

    if(bot['enabledModules']['selfCommands'] !== true && self) return;

    if(commands[0] !== true) return;

    for(command of commands) {
        if(message == command['command_name']) {
            for(response of command['responses']) {
                let res = response.replace('{USER.USERNAME}', userState.username)
                    .replace('{TIME.DATE}', new Date(Date.now()).toString())
                    .replace('{TIME.HH_MM_SS}', `${new Date(Date.now()).toLocaleTimeString("en-us", {timeStyle: "long"})}`)
                    .replace('{USER.DISPLAY_NAME}', userState['display-name'])
                    .replace('{USER.BADGE_INFO}', userState['badge-info'])
                    .replace('{MESSAGE.TYPE}', userState['message-type'])
                    .replace('{ROOM.ID}', userState['room-id'])
                    .replace('{USER.USERNAME}', userState.username)
                    .replace('{USER.COLOR}', userState.color)
                    .replace('{USER.BADGES}', userState.badges)
                    .replace('{USER.BITS}', userState.bits)
                    .replace('{USER.EMOTES}', userState.emotes)
                    .replace('{USER.FLAGS}', userState.flags)
                    .replace('{USER.ID}', userState.id)
                    .replace('{USER.MOD}', userState.mod)
                    .replace('{USER.SUBSCRIBER}', userState.subscriber)
                    .replace('{USER.TURBO}', userState.turbo)
                    .replace('{CHANNEL}', channel.substring(1))

                if(command['response_options']['type'] == 'action')
                    await client.action(channel, res);

                else if(command['response_options']['type'] == 'say')
                    await client.action(channel, res);

                else
                    throw 'ERR >> Response options incorrectly figured at initialization message, "type"';
            }
        }
    }
});

client.on('connected', async () => {
    const init = bot['enabledModules']['init'];

    if(init['console']['enabled'] === true) {
        if(init['console']['styling']['style']) {
            console.log(color[init['console']['styling']['color']](style[init['console']['styling']['style']](init['console']['message'])));
        } else {
            console.log(color[init['console']['styling']['color']](init['console']['message']));
        }
    }

    if(init['message']['enabled'] === true) {
        for(response of init['message']['messages']) {
            if(init['message']['message_options']['type'] == 'action') {
                await client.action(init['message']['message_options']['channel'], response);
            }

            else if(init['message']['message_options']['type'] == 'say') {
                await client.say(init['message']['message_options']['channel'], response);
            }

            else
                throw 'ERR >> Response options incorrectly figured at initialization message, "type"';
        }
    }
});

client.connect();
