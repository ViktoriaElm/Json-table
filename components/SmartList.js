import { useState } from 'react';
// import TBody from '../components/TBody';
// import THead from '../components/THead';

export default function SmartList({ startData, columns, DetailsComponent }) {
  // console.log('SmartList detailsComponent=',DetailsComponent);
  const
    [filterValue, setFilter] = useState(''),
    [editRow, setEditRow] = useState(null),
    [editCol, setEditCol] = useState(null),
    [editContent,setEditContent] = useState(''),
    // eslint-disable-next-line no-unused-vars
    [data, setData] = useState(startData),
    [detailsId,setDetailsId] = useState(null),
    [sortCol, setSortCol] = useState(0); //+1,+2,+3... : asc by 0,1,2-th col,   -1,-2,-3 : desc 0,1,2-th col 
  let
    // eslint-disable-next-line no-unused-vars
    viewData = data;
  if (sortCol) {
    const
      { getVal } = columns[Math.abs(sortCol) - 1];
    viewData.sort((a, b) => Math.sign(sortCol) * getVal(a).localeCompare(getVal(b)));
  }
  if (filterValue) {
    // viewData = viewData.filter(obj=>JSON.stringify(obj).includes(filterValue));
    viewData = viewData.filter(obj => columns
      .map(col => col.getVal(obj).toString().toLowerCase())
      .some(str => str.includes(filterValue.toLowerCase())));
  }

  return <>
    filter:<input type="search" value={filterValue} onInput={evt => setFilter(evt.target.value)}></input>
    <table className="smart">
      <thead>
        <tr onClick={evt => {
          const index = evt.target.closest('th')?.cellIndex;
          switch (true) {
            case Math.abs(sortCol) - 1 !== index:
              setSortCol(index + 1);
              return;
            case sortCol - 1 === index:
              setSortCol(-sortCol);
              return;
            case -sortCol - 1 === index:
              setSortCol(0);
              return;
          }
        }
        }>
          {columns?.map((el, i) =>
            <th key={el.name} className={(Math.abs(sortCol) - 1 === i ? 'sort ' : '') + (-sortCol - 1 === i ? ' desc' : '')}>{el.name}</th>)
          }
          {DetailsComponent && <th></th>}
        </tr>
      </thead>

      <tbody onDoubleClick={evt => {
        const td = evt.target.closest('td');
        if (td) {
          const 
            col = td.cellIndex,
            row = td.closest('tr')?.sectionRowIndex;
          setEditCol(col);
          setEditRow(row);
          setEditContent(columns[col].getVal(viewData[row]));
        }
      }}>

        {viewData.map((el, rowN) =>
          <tr key={el.id}>
            {columns.map((col, colN) => <td key={col.name} title={columns[colN].setVal && "double click to edit"}>
              {(rowN === editRow && colN === editCol && columns[colN].setVal)
                ? (<>
                  <input type="text" value={editContent} onInput={evt=>setEditContent(evt.target.value)} />
                  <button onClick={_=>{
                    setEditRow(null);
                    const clone=[...data];
                    clone[rowN]= columns[colN].setVal(clone[rowN],editContent);
                    setData(clone);                    
                  }}>🆗</button></>)
                : (col.wrap ? <col.wrap value={col.getVal(el)} /> : col.getVal(el))
              }</td>)}
            {DetailsComponent && <td><button onClick={_=>setDetailsId(el.id)}>Details</button></td>}
          </tr>)}
      </tbody>
    </table>
    {detailsId && <DetailsComponent id={detailsId} />}
  </>;
}