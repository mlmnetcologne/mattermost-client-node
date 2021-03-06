import Log from 'log';
import { EventEmitter } from 'events';
import Api from './api';
import Authentication from './authentication';
import Channel from './channel';
import Post from './post';
import Team from './team';
import User from './user';
import Websocket from './websocket';

const usersRoute = '/users';

class Client extends EventEmitter {
    host: string;

    team: string;

    options: IOptions;

    logger: any;

    me: any = null;

    Api: Api;

    Authentication: Authentication;

    Channel: Channel;

    Post: Post;

    User: User;

    Team: Team;

    Websocket: Websocket;

    // @Todo change "group" to "team"
    constructor(host: string, team: string, options: IOptions) {
        super();

        this.host = host;
        this.team = team;
        this.options = options || { wssPort: 443, httpPort: 80 };
        this._setLogger();
        this.initModules();

        process.env.LOG_LEVEL = process.env.MATTERMOST_LOG_LEVEL || 'info';
    }

    private _setLogger(): any {
        if (typeof this.options.logger !== 'undefined') {
            switch (this.options.logger) {
            case 'noop':
                this.logger = {
                    debug: (): any => {
                        // do nothing
                    },
                    info: (): any => {
                        // do nothing
                    },
                    notice: (): any => {
                        // do nothing
                    },
                    warning: (): any => {
                        // do nothing
                    },
                    error: (): any => {
                        // do nothing
                    },
                };
                break;
            default:
                this.logger = this.options.logger;
                break;
            }
        } else {
            this.logger = Log;
        }
    }

    initModules(): any {
        this.Api = new Api(this);
        this.Authentication = new Authentication(this, usersRoute);
        this.Channel = new Channel(this, usersRoute);
        this.Post = new Post(this);
        this.User = new User(this, usersRoute);
        this.Team = new Team(this, usersRoute);
        this.Websocket = new Websocket(this);
    }

    // @Todo Decide on where to put this one
    dialog(triggerId: string, url: string, dialog: any): any {
        const postData = {
            // eslint-disable-next-line @typescript-eslint/camelcase
            trigger_id: triggerId,
            url,
            dialog,
        };
        return this.Api.apiCall(
            'POST',
            '/actions/dialogs/open',
            postData,
            (_data: any, _headers: any) => {
                this.logger.debug('Created dialog');
            },
        );
    }
}

export default Client;
