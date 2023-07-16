export class ErrorHttpDto{
    constructor(new_code: string, new_message: string) {
        this.code = new_code
        this.message = new_message
    }

    code: string;
    message: string;
}