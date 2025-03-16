



## Local setup

Create a `.env` file within the root directory with 

```
REDIS_URL=<REDIS URL>
SUPABASE_URL=<YOUR SUPABASE PROJECT URL>
SUPABASE_ANON_KEY=<YOUR SUPABASE ANON KEY>
CONFIG_KEYWORDS=permissions,unauthorised,new_user<ADD ALL THE KEYWORDS THAT YOU WANT TO TRACK HERE>
PORT=4000
JWT_SECRET=<YOUR SUPABASE JWT SECRET>

```

Install dependencies

```
npm install
```

Run the bull-mq worker
```
ts-node .\src\queue\worker.ts
```
Run the  server:

```bash
npx ts-node src/server.ts
```
