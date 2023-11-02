const resetButton = document.querySelector('#resetPuzzleButton');
const initWindow = document.querySelector('#initWindow');

const imageInput = document.querySelector('#imageInput');
const setImageButton = document.querySelector('#setImageButton');
const previewImage = document.querySelector('#previewImage');
const sourceImage = document.querySelector('#sourceImage');
let imageHeight;
let imageWidth;

const rowInput = document.querySelector('#rowInput');
const cellInput = document.querySelector('#cellInput');

const newButton = document.querySelector('#newPuzzleButton');

const cellTable = document.querySelector('.cellTable');
let cells = [];
let fragments = [];

const fragmentsList = document.querySelector('#fragmentsList');

class Cell
{
    constructor()
    {
        this.id = cells.length;
        this.fragment = null;
        this.complete = false;

        this.createHTML();
        this.createEvents();

        cells.push(this);
    }

    createHTML()
    {
        this.cellHTML = document.createElement('div');
        this.cellHTML.id = `cell${this.id}`;
        this.cellHTML.className = 'cell';
    }

    createEvents()
    {
        this.cellHTML.addEventListener('dragover', dragOver);
        this.cellHTML.addEventListener('drop', drop);
        this.cellHTML.addEventListener('drop', checkPuzzle);
    }
}

class Fragment
{
    constructor(a, b, cellHeight, cellWidth)
    {
        this.id = fragments.length;
        this.cell = null;
        
        this.createHTML();
        this.createImage(a, b, cellHeight, cellWidth);
        this.createEvents();

        fragments.push(this);
    }

    createHTML()
    {
        this.canvas = document.createElement('canvas');
        this.canvas.id = `frag${this.id}`;
        this.canvas.classList.add('fragment');
        this.canvas.draggable = true;
    }

    createImage(a, b, cellHeight, cellWidth)
    {
        const context = this.canvas.getContext('2d');
        context.drawImage(
            sourceImage,
            b * cellWidth, a * cellHeight,
            cellWidth, cellHeight,
            0, 0,
            this.canvas.width, this.canvas.height);
    }

    createEvents()
    {
        this.canvas.addEventListener('dragstart', dragStart);
    }
}

init();

function init()
{
    resetButton.addEventListener('click', openInitWindow);

    setImageButton.addEventListener('click', setImage);
    sourceImage.addEventListener('load', imageLoad);

    rowInput.min = 1;
    cellInput.min = 1;
    rowInput.value = 1;
    cellInput.value = 1;
    rowInput.max = 1;
    cellInput.max = 1;

    newButton.addEventListener('click', closeInitWindow);
}

function createPuzzle(rowCount, cellCount)
{
    const cellHeight = imageHeight / rowCount;
    const cellWidth = imageWidth / cellCount;

    createStyle(cellHeight, cellWidth);

    createCellTable(rowCount, cellCount);

    createFragments(rowCount, cellCount, cellHeight, cellWidth);
}

function createStyle(height, width)
{
    const style = document.createElement('style');
    style.id = 'puzzleStyles';
    document.head.appendChild(style);

    const styleSheet = style.sheet;
    styleSheet.insertRule(`.row {display: flex; height: ${Math.ceil(height) + 1}px;}`, styleSheet.cssRules.length);
    styleSheet.insertRule(`.cell {width: ${Math.ceil(width) + 1}px; border: 1px solid #000;}`, styleSheet.cssRules.length);
    styleSheet.insertRule(`.fragment {width: ${width}px; height: ${height}px; border: 1px dashed #000}`, styleSheet.cssRules.length);
}

function createCellTable(rowCount, cellCount)
{
    createRows(cellTable, rowCount, cellCount);
}

function createRows(cellTable, rowCount, cellCount)
{
    for(let a = 0; a < rowCount; a++)
    {
        const row = document.createElement('div');
        row.className = 'row';

        cellTable.insertAdjacentElement('beforeend', row);

        createCells(row, cellCount);
    }
}

function createCells(row, cellCount)
{
    for(let a = 0; a < cellCount; a++)
    {
        const cell = new Cell();

        row.insertAdjacentElement('beforeend', cell.cellHTML);
    }
}

function createFragments(rowCount, cellCount, cellHeight, cellWidth)
{
    const frags = new Array();

    for(let a = 0; a < rowCount; a++)
    {
        for(let b = 0; b < cellCount; b++)
        {
            const fragment = new Fragment(a, b, cellHeight, cellWidth);

            frags.push(fragment);
        }
    }

    shuffleArray(frags);

    for(let a = 0; a < frags.length; a++)
    {
        fragmentsList.insertAdjacentElement('beforeend', frags[a].canvas);
    }
}

function clearPuzzle()
{
    imageInput.value = '';
    previewImage.src = ''
    sourceImage.src = '';
    
    rowInput.max = 1;
    cellInput.max = 1;
    rowInput.value = 1;
    cellInput.value = 1;

    for(let a = 0; a < fragments.length; a++)
    {
        fragments[a].canvas.removeEventListener('dragstart', dragStart);
        fragments[a].canvas.parentNode.removeChild(fragments[a].canvas);
        fragments[a].canvas.remove();
        fragments[a].canvas = null;
    }
    fragments = [];

    for(let a = 0; a < cells.length; a++)
    {
        cells[a].cellHTML.removeEventListener('dragover', dragOver);
        cells[a].cellHTML.removeEventListener('drop', drop);
        cells[a].cellHTML.removeEventListener('drop', checkPuzzle);
        cells[a].cellHTML.parentNode.removeChild(cells[a].cellHTML);
        cells[a].cellHTML.remove();
        cells[a].cellHTML = null;
    }
    cells = [];

    let rows = document.querySelectorAll('.row');
    for(let a = 0; a < rows.length; a++)
    {
        rows[a].parentNode.removeChild(rows[a]);
        rows[a].remove();
        rows[a] = null;
    }

    let styleSheet = document.querySelector('#puzzleStyles');
    styleSheet.parentNode.removeChild(styleSheet);
    styleSheet.remove();
    styleSheet = null;
    
    document.querySelector('#congratulation').classList.add('hide');
}



function openInitWindow(event)
{
    initWindow.classList.remove('hide');

    clearPuzzle();
}

function closeInitWindow(event)
{
    initWindow.classList.add('hide');

    createPuzzle(rowInput.value, cellInput.value);
}

function setImage(event)
{
    let imageFile = imageInput.files[0];

    if(imageFile)
    {
        previewImage.src = URL.createObjectURL(imageFile);
        sourceImage.src = URL.createObjectURL(imageFile);
        localStorage.setItem('image', sourceImage.src);
    }
}

function imageLoad(event)
{
    imageHeight = sourceImage.height;
    imageWidth = sourceImage.width;

    rowInput.max = Math.ceil(imageHeight / 50);
    cellInput.max = Math.ceil(imageWidth / 50);
}

function dragStart(event)
{
    const fragIndex = event.target.id.split(/frag/)[1];

    event.dataTransfer.setData('text', fragIndex);
}

function dragOver(event)
{
    if(event.target.nodeName.toLowerCase() === 'canvas')
    {
        return true;
    }

    if(this.id.search(/cell\d{1,}/) >= 0)
    {
        const index = Number(this.id.split(/cell/)[1]);

        if(cells[index].fragment !== null)
        {
            return true
        }
    }

    event.preventDefault();
}

function drop(event)
{
    event.preventDefault();

    const cellIndex = Number(this.id.split(/cell/)[1]);
    const fragIndex = Number(event.dataTransfer.getData('text'));

    const cell = cells[cellIndex];
    const fragment = fragments[fragIndex];

    if(fragment.cell !== null)
    {
        fragment.cell.complete = false;
        fragment.cell.fragment = null;
        fragment.cell = null;
    }

    cell.fragment = fragment;
    fragment.cell = cell;

    cell.cellHTML.appendChild(fragment.canvas);

    if(cellIndex === fragIndex)
    {
        cell.complete = true;
    }
}

function shuffleArray(array)
{
    for(let a = array.length - 1; a > 0; a--)
    {
        let b = Math.floor(Math.random() * (a + 1));

        [array[a], array[b]] = [array[b], array[a]];
    }
}

function checkPuzzle()
{
    for(let a = 0; a < cells.length; a++)
    {
        if(cells[a].complete === false)
        {
            return;
        }
    }
    document.querySelector('#congratulation').classList.remove('hide');
}