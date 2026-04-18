const storageKeys = ['inSName', 'inSession', 'inID', 'inReg'];

window.onload = () => {
    document.getElementById('inDate').valueAsDate = new Date();
    storageKeys.forEach(key => {
        const savedValue = localStorage.getItem(key);
        if (savedValue) document.getElementById(key).value = savedValue;
    });
    syncPreview();
};

function syncPreview() {
    const isPreviewOn = document.getElementById('togglePreview').checked;
    const section = document.getElementById('preview-section');
    const scaleBox = document.getElementById('preview-scale-box');
    const element = document.getElementById('assignment-page');

    if (!isPreviewOn) {
        section.style.display = 'none';
        element.style.display = 'none';
        return;
    }

    element.style.display = 'block';
    section.style.display = 'flex';
    scaleBox.appendChild(element);

    // Update data
    document.getElementById('outTitle').innerText = document.getElementById('inTitle').value || "Assignment Title";
    document.getElementById('outCCode').innerText = document.getElementById('inCCode').value || "AG-000";
    document.getElementById('outCTitle').innerText = document.getElementById('inCTitle').value || "Course Title";
    document.getElementById('outSName').innerText = document.getElementById('inSName').value || "Student Name";
    document.getElementById('outID').innerText = document.getElementById('inID').value || "0000";
    document.getElementById('outReg').innerText = document.getElementById('inReg').value || "0000";
    document.getElementById('outSession').innerText = document.getElementById('inSession').value;
    document.getElementById('outTName').innerText = document.getElementById('inTName').value || "Teacher Name";
    document.getElementById('outTGrade').innerText = document.getElementById('inTGrade').value;
    document.getElementById('outTDept').innerText = document.getElementById('inTDept').value || "...";
    document.getElementById('outFooterDept').innerText = document.getElementById('inTDept').value || "...";

    // Date Visibility
    const showDate = document.getElementById('showDate').checked;
    document.getElementById('dateSection').style.display = showDate ? 'block' : 'none';

    const subDate = document.getElementById('inDate').value;
    document.getElementById('outDate').innerText = subDate ? new Date(subDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "";

    const isMS = document.getElementById('isMS').checked;
    const sem = document.getElementById('inSem').value || "0";
    const lvl = document.getElementById('inLevel').value || "0";
    const grp = document.getElementById('inGroup').value || "G-0";
    const sec = document.getElementById('inSection').value || "N/A";

    const dyn = document.getElementById('outDyn');
    if (isMS) {
        dyn.innerHTML = `<div class="single-line"><b>Semester:</b> ${sem}</div>`;
    } else {
        dyn.innerHTML = `<div class="single-line"><b>Level:</b> ${lvl}, <b>Sem:</b> ${sem}</div>` +
            `<div class="single-line"><b>Sec:</b> ${sec}, <b>Grp:</b> ${grp}</div>`;
    }
}

function toggleForm() {
    const isMS = document.getElementById('isMS').checked;
    document.getElementById('levelCol').style.display = isMS ? 'none' : 'block';
    document.getElementById('ugRow2').style.display = isMS ? 'none' : 'flex';

    const fields = ['inLevel', 'inSem', 'inID', 'inReg'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        el.type = isMS ? "text" : "number";
    });
}

async function generatePDF() {
    const requiredFields = [
        'inTitle', 'inCCode', 'inCTitle', 'inSem',
        'inSName', 'inID', 'inReg', 'inTName', 'inTDept'
    ];

    if (document.getElementById('showDate').checked) {
        requiredFields.push('inDate');
    }

    const isMS = document.getElementById('isMS').checked;
    if (!isMS) { requiredFields.push('inLevel'); }

    let firstEmptyField = null;
    for (const id of requiredFields) {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
            el.style.borderColor = "#e25555";
            if (!firstEmptyField) firstEmptyField = el;
        } else { el.style.borderColor = "#edf2f7"; }
    }

    if (firstEmptyField) {
        alert("Please fill in all mandatory fields before downloading.");
        firstEmptyField.focus();
        return;
    }

    storageKeys.forEach(key => localStorage.setItem(key, document.getElementById(key).value));

    const cCode = document.getElementById('inCCode').value;
    const idNo = document.getElementById('inID').value;
    const element = document.getElementById('assignment-page');

    document.body.appendChild(element);
    element.style.display = 'block';

    const dlBtn = document.getElementById('dlBtn');
    dlBtn.innerText = "Generating PDF...";
    dlBtn.disabled = true;

    const opt = {
        margin: 0,
        filename: `${idNo}_${cCode}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 3, useCORS: true, scrollY: 0, height: 1122 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
            if (document.getElementById('togglePreview').checked) {
                syncPreview();
            } else {
                element.style.display = 'none';
            }
            dlBtn.innerText = "Download Cover Page PDF";
            dlBtn.disabled = false;
        });
    }, 600);
}