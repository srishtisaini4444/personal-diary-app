fetch("/api/entries")
.then(response => response.json())
.then(entries => {

    const container = document.getElementById("entriesContainer");

    if(entries.length === 0){

        container.innerHTML = `
        <div class="entry-card">

        <h2>📖</h2>

        <p>No diary entries yet.</p>

        <p>Write your first memory today!</p>

        </div>

        `;

        return;

    }

    entries.forEach(entry => {

        container.innerHTML += `
        
        <div class="entry-card">

            <h3>📅 ${entry.date}</h3>

            <small>🕒 ${entry.time}</small>

            <p>${entry.content}</p>

            <div class="entry-actions">

<form action="/edit-entry/${entry.id}" method="GET">
<button class="edit-btn">✏ Edit</button>
</form>

<form
action="/delete-entry/${entry.id}"
method="POST"
onsubmit="return confirm('Delete this diary entry?')">
<button class="delete-btn">🗑 Delete</button>
</form>

</div>

        </div>

        `;

    });

});