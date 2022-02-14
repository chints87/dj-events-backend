'use strict';
const { sanitizeEntity } = require('strapi-utils')
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

// Over-ride existing default controllers or create new ones

module.exports = {
    // Get logged in users events
    async me(ctx){
        // Gets user info from the JSON web token
        const user = ctx.state.user;

        if(!user){
            return ctx.badRequest(null, 
                [{messages: [{id: "No authorization header was found"} ]}])
        }
        
        // Get event data of the user from the DB
        const data = await strapi.services.events.find({user: user.id})

        if(!data){
            return ctx.notFound()
        }
        
        // Return data in the object form 
        return sanitizeEntity(data, { model: strapi.models.events})
    }
};
