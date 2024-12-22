


export default class interConnection {
    async putReward(userId: string, point: number | undefined, reason: string) {
        let data = { reason: { reason: reason, point: point }, userId: userId }
        const rawResponse = await fetch(`http://localhost:5000/interservice/put-new-point`, {
            method: 'PUT',
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        const response = await rawResponse.json()
        return response;
    }


    async resetCache() {
        const rawResponse = await fetch(`http://localhost:5004/app/interservice/reset-cache`, {
            method: 'PUT',
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
            },
        })

        const response = await rawResponse.json()
        
        const rawResponse2 = await fetch(`http://localhost:5003/app/interservice/reset-cache`, {
            method: 'PUT',
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
            },
        }) 

        
        const rawResponse3 = await fetch(`http://localhost:5005/app/interservice/reset-cache`, {
            method: 'PUT',
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
            },
        }) 

        const response2 = await rawResponse2.json()
        return response;
    }

}