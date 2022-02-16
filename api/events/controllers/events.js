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
                [{messages: [{id: "No userization header was found"} ]}])
        }
        
        // Get event data of the user from the DB
        const data = await strapi.services.events.find({user: user.id})

        if(!data){
            return ctx.notFound()
        }
        
        // Return data in the object form 
        return sanitizeEntity(data, { model: strapi.models.events})
    },

    //Create events to be associated to the user that created it
    async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          data.user = ctx.state.user.id;
          entity = await strapi.services.events.create(data, { files });
        } else {
          ctx.request.body.user = ctx.state.user.id;
          entity = await strapi.services.events.create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.events });
      },
      
    //Update event specific to a user
      async update(ctx) {
        const { id } = ctx.params;
    
        let entity;
    
        const [events] = await strapi.services.events.find({
          id: ctx.params.id,
          'user.id': ctx.state.user.id,
        });

        // If one user tries to modify another user's events    
        if (!events) {
          return ctx.unauthorized(`You can't update this entry`);
        }
    
        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          entity = await strapi.services.events.update({ id }, data, {
            files,
          });
        } else {
          entity = await strapi.services.events.update({ id }, ctx.request.body);
        }
    
        return sanitizeEntity(entity, { model: strapi.models.events });
      },

    // Delete user event
    async delete(ctx){
        const { id } = ctx.params;

        const [events] = strapi.services.events.delete(
            { 
               id : id,
              "user.id" : ctx.state.user.id,  
            }
        );
        
        // If one user tries to delete another users events
        if (!events){
            return ctx.unauthorized(`You can't update this entry`)
        }
    }  
};
