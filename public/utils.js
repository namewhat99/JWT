
let jwtToken = (() => {

    let jwtToken = null;

    return{

        setToken: (token) => {
            jwtToken = token;
        },

        getToken: () => {
            return jwtToken;
        },

        removeToken: () => {
            jwtToken = null;
        }
    }
})

export default jwtToken();