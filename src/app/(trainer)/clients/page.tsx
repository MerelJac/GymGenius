export default function ClientsPage() {
  async function invite(formData: FormData) {
    "use server"
    const email = formData.get("email")

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/invites`, {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  return (
    <div>
      <h1>Clients</h1>

      <form action={invite}>
        <input name="email" placeholder="client@email.com" />
        <button type="submit">Send Invite</button>
      </form>
    </div>
  )
}
