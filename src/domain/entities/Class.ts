export type ClassType = 'SALA' | 'LABORATORIO' | 'AUDITORIO';
export type ClassStatus = 'INDISPONIVEL' | 'DISPONIVEL';

export interface ClassProps {
    id: string;
    name: string;
    description?: string | null;
    capacity: number;
    type: ClassType;
    status: ClassStatus; 
    createdAt: Date;
    updatedAt: Date;
}

export class Class {
    private readonly props: ClassProps;

    constructor(props: ClassProps){
        this.props = props
    }

    get id(): string {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get description(): string | null | undefined {
        return this.props.description;
    }

    get capacity(): number {
        return this.props.capacity;
    }

    get type(): ClassType {
        return this.props.type;
    }

    get status(): ClassStatus {
        return this.props.status;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    isActive(): boolean {
        return this.props.status === 'DISPONIVEL';
    }
}


