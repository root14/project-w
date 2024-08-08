import jwt, { JwtPayload } from 'jsonwebtoken';

function jwtValidate(token: string) {
    let result = false
    jwt.verify(token, process.env.JWT_SECRET_KEY as string, (error, decoded) => {
        if (error) {
            result = false
        } else {
            result = true;
        }
    });
    return result
}



export { jwtValidate }