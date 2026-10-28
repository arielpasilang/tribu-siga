const ApproveConnection = ({ clientName, clientId, redirectHost, fields }) => (
  <form className="auth-form" method="post" action="/api/oauth/approve/">
    {Object.entries(fields).map(([name, value]) => (
      <input key={name} type="hidden" name={name} value={value || ""} />
    ))}
    <p>
      <strong>{clientName}</strong> wants to connect to Tribu Siga. After you approve, you return to{" "}
      <strong>{redirectHost}</strong>.
    </p>
    <p className="hint">Client ID {clientId}. This can read and add hikes, milestones, and galleries.</p>
    <div className="oauth-actions">
      <button className="btn btn-primary" type="submit" name="decision" value="approve">
        Approve connection
      </button>
      <button className="btn btn-ghost" type="submit" name="decision" value="deny">
        Cancel
      </button>
    </div>
  </form>
)

export default ApproveConnection
