export interface ICreateResponse {
    data?: any;
    isError?: boolean;
    errorMessage?: string;
}

export const createResponse = ({
    data = {},
    isError = false,
    errorMessage = '',
}: ICreateResponse) => ({
    result: data,
    isError,
    errorMessage,
    success: !isError,
});
