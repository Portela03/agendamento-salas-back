export interface ResetPasswordProps {
  id:        string;   
  userId:    string;
  tokenHash: string;
  expireAt:  Date;
  used:      boolean;
  createdAt: Date; 
}


export class ResetPassword {
    private readonly props: ResetPasswordProps;

    constructor(props: ResetPasswordProps){
        this.props = props
    }

    get id(): string {
        return this.props.id;
    }

    get userId(): string {
    return this.props.userId;
    }

    get tokenHash(): string {
    return this.props.tokenHash;
    }

    get expireAt(): Date {
    return this.props.expireAt;
    }

    get used(): boolean {
    return this.props.used;
    }

    get createdAt(): Date {
    return this.props.createdAt;
    }

    toJSON(): ResetPasswordProps {
    return { ...this.props };
}
}