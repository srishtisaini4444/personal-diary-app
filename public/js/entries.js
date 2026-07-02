fetch("/api/entries")
.then(response => response.json())
.then(entries => {

    const container = document.getElementById("entriesContainer");

    if(entries.length === 0){

        container.innerHTML = "<h3>No diary entries yet.</h3>";

        return;

    }

    entries.forEach(entry => {

        container.innerHTML += `
        
        <div class="entry-card">

            <p>${entry.content}</p>

            <form action="/edit-entry/${entry.id}" method="GET">

                <button class="edit-btn">

                    ✏ Edit

                </button>

            </form>

            <form action="/delete-entry/${entry.id}" method="POST">

                <button class="delete-btn">

                    🗑 Delete

                </button>

            </form>

        </div>

        `;

    });

});