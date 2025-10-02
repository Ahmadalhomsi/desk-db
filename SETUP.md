# 🚀 Quick Setup Guide for MAPOS AnyDesk Manager

## Prerequisites

Before you begin, make sure you have:
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git (optional)

## Step-by-Step Setup

### 1️⃣ Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL if you haven't already
# Then create a database
createdb deskdb
```

**Option B: Cloud PostgreSQL (Recommended)**
- Use [Supabase](https://supabase.com) (Free tier available)
- Or [Neon](https://neon.tech) (Free tier available)
- Or [Railway](https://railway.app) (Free tier available)

### 2️⃣ Environment Configuration

1. Open the `.env` file in your project root
2. Update the `DATABASE_URL` with your actual database credentials:

```env
# For local PostgreSQL:
DATABASE_URL="postgresql://username:password@localhost:5432/deskdb?schema=public"

# For Supabase:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# For Neon:
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require"
```

### 3️⃣ Install Dependencies

```bash
npm install
```

### 4️⃣ Initialize Database

Run the Prisma migrations to create your database tables:

```bash
npx prisma migrate dev --name init
```

If prompted to create the database, type `y` and press Enter.

### 5️⃣ Generate Prisma Client

```bash
npx prisma generate
```

### 6️⃣ Start the Development Server

```bash
npm run dev
```

Your app should now be running at [http://localhost:3000](http://localhost:3000) 🎉

## 🔧 Troubleshooting

### Issue: "Can't reach database server"
- Check if PostgreSQL is running
- Verify your DATABASE_URL credentials
- Make sure the database exists

### Issue: "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### Issue: Prisma Client errors
- Run `npx prisma generate` again
- Restart your development server

### Issue: Migration errors
- Check if the database is accessible
- Try running `npx prisma migrate reset` (⚠️ This will delete all data)
- Then run `npx prisma migrate dev` again

## 🎯 First Steps

1. Click **"Add Customer"** to add your first AnyDesk connection
2. Fill in the customer details:
   - Name: "John's Office PC"
   - AnyDesk ID: "123456789"
   - Category: "Office"
   - Notes: "Main workstation"
3. Click the card to test the AnyDesk connection!

## 📊 Using Prisma Studio (Optional)

Want to view and edit your database visually?

```bash
npx prisma studio
```

This opens a web interface at [http://localhost:5555](http://localhost:5555)

## 🚀 Building for Production

When you're ready to deploy:

```bash
npm run build
npm start
```

## 💡 Pro Tips

1. **Backup your data**: Regular database backups are important
2. **Use categories effectively**: Create meaningful categories like "Office", "Remote", "VIP", etc.
3. **Add notes**: Use the notes field for important details like access times or special instructions
4. **Test AnyDesk**: Make sure AnyDesk is installed and the protocol handler is working

## 🆘 Need Help?

- Check the main [README.md](./README.md) for more details
- Review Prisma docs: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- Review Next.js docs: [https://nextjs.org/docs](https://nextjs.org/docs)

---

**Happy managing! 🎉**
