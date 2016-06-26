# Dashberry Pi
Simple dashboard for Raspberry Pi based on [ozua's raspberry pi dash](http://www.instructables.com/id/Raspberry-Pi-Wall-Mounted-Calender-and-Notificatio/?ALLSTEPS).  The major difference being the Chore widget.

It uses [Vue.js](http://vuejs.org) for the client, [Express.js](http://expressjs.com/) for the server, and [Socket.io](http://socket.io/) for live updates.

There will eventually be a companion iPhone app.

## SAMPLE ACTIONS
Chores
- get chores
  - fields
    - title
    - description
    - users
    - asignee
  - filters
    - user
    - get all
- update chore
- create chore
- delete chore

TODO - Users

## SETUP
Clone and npm install
Install mongod and mongodb
Start `mongod` and `mongodb`
Run `use chores`

## Validation
The validation library (located in `store/valid`) allows for easy validation of properties based on a schema definition.

```
let validate = valid.defineSchema({
  label: valid.str({
    required: true,
    alpha: true,
    length: {
      min: 2,
      max: 64
    }
  }),
  person_id: valid.mongoId({
    many: false,
    required: false,
  })
});

// Then run a validation
let validObj = validate.all({
  label: 'something special'
});

// Returns a validated object, or false if invalid

```

### valid.defineSchema
Returns validation methods.  All validations methods return either a validated object (a duplicate of the original), or `false` if validation has failed.

| Method     | Args               | Description                                                                       |
|------------|--------------------|-----------------------------------------------------------------------------------|
| all        | object to validate | Validates a complete record.  Good for creation of new records.                   |
| allPresent | object to validate | Validates passed values, but not the complete record.  Good for updating records. |


### valid.str
| Argument | Type    | Default   | Description                                               |
|----------|---------|-----------|-----------------------------------------------------------|
| required | boolean | false     | Indicates if the property is required                     |
| alpha    | boolean | false     | Indicates if the property should be alpha numeric         |
| length   | object  | undefined | Accepts min and max properties, which limit string length |
| encode   | boolean | false     | Forces encoding of passed values                          |

### valid.mongoId
| Argument | Type    | Default | Description                                    |
|----------|---------|---------|------------------------------------------------|
| required | boolean | false   | Indicates if the property is required          |
| many     | boolean | false   | Indicates if there will be many records stored |
