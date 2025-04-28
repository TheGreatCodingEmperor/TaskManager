import { Injectable } from '@angular/core';
type DataRow = Record<string, any>;

export interface PivotOptions {
  rowNames: string[];
  colNames: string[];
  valueAggs: Record<string, (values: any[]) => any>;
}

@Injectable({
  providedIn: 'root'
})
export class BiService {
  sum = (values: any[]) => values.reduce((a, b) => a + b, 0)
  fns: Record<string, (values: any[]) => any> = {
    sum: (values: any[]) => values.reduce((a, b) => a + b, 0),
    first: (values: any[]) => (values.length > 0 ? values[0] : null),
  };

  constructor() { }

  test(colNames: string[], rowNames: string[], valueNames: { name: string, fn: string }[]) {
    const data = [
      {
        "region": "Asia",
        "country": "Taiwan",
        "brand": "Giant",
        "model": "Escape 3",
        "salesDate": "2025-04-01",
        "quantity": 5,
        "unitPrice": 450
      },
      {
        "region": "Asia",
        "country": "Taiwan",
        "brand": "Merida",
        "model": "Crossway 100",
        "salesDate": "2025-04-02",
        "quantity": 3,
        "unitPrice": 500
      },
      {
        "region": "Asia",
        "country": "Japan",
        "brand": "Bridgestone",
        "model": "Anchor RS8",
        "salesDate": "2025-04-03",
        "quantity": 2,
        "unitPrice": 1200
      },
      {
        "region": "Europe",
        "country": "Germany",
        "brand": "Canyon",
        "model": "Endurace CF 7",
        "salesDate": "2025-04-04",
        "quantity": 4,
        "unitPrice": 1500
      },
      {
        "region": "Europe",
        "country": "Germany",
        "brand": "Cube",
        "model": "Agree C:62",
        "salesDate": "2025-04-05",
        "quantity": 3,
        "unitPrice": 1300
      },
      {
        "region": "North America",
        "country": "USA",
        "brand": "Trek",
        "model": "Domane AL 2",
        "salesDate": "2025-04-06",
        "quantity": 6,
        "unitPrice": 999
      },
      {
        "region": "North America",
        "country": "USA",
        "brand": "Specialized",
        "model": "Allez",
        "salesDate": "2025-04-07",
        "quantity": 4,
        "unitPrice": 1100
      },
      {
        "region": "North America",
        "country": "Canada",
        "brand": "Norco",
        "model": "Search XR A",
        "salesDate": "2025-04-08",
        "quantity": 2,
        "unitPrice": 950
      },
      {
        "region": "Europe",
        "country": "France",
        "brand": "Lapierre",
        "model": "Sensium 3.0",
        "salesDate": "2025-04-09",
        "quantity": 3,
        "unitPrice": 1400
      },
      {
        "region": "Asia",
        "country": "Taiwan",
        "brand": "Giant",
        "model": "Talon 1",
        "salesDate": "2025-04-10",
        "quantity": 5,
        "unitPrice": 700
      }
    ];

    let option: PivotOptions = {
      colNames: colNames,
      rowNames: rowNames,
      valueAggs: {}
    };
    valueNames.forEach(valueName => {
      option.valueAggs[valueName.name] = this.fns[valueName.fn];
    })
    let result = this.pivotTable(data, option);
    return result;
  }

  pivotTable(
    data: DataRow[],
    options: PivotOptions
  ): { 
    result: Record<string, any>, 
    rowKeys:string[],
    colKeys:string[]
  } {
    const { rowNames, colNames, valueAggs } = options;
    const result: Record<string, any> = {};
    let rowKeysObj:Record<string,boolean> = {};
    let colKeysObj:Record<string,boolean> = {};

    data.forEach((row) => {
      // 建立列的鍵
      const rowKey = rowNames.map((name) => row[name]).join("||");
      rowKeysObj[rowKey] = true;
      // colKey = A||North||150||30
      // 建立欄的鍵
      const colKey = colNames.map((name) => row[name]).join("||");
      colKeysObj[colKey] = true;
      // rowKey = A||North||150||30

      // 初始化列
      if (!result[rowKey]) {
        result[rowKey] = {};
      }
      // result["A||North||150||30"] = {}

      // 初始化欄
      if (!result[rowKey][colKey]) {
        // result["A||North||150||30"]["A||North||150||30"] = {}
        result[rowKey][colKey] = {};
        for (const valName in valueAggs) {
          result[rowKey][colKey][valName] = [];
          // result["A||North||150||30"]["A||North||150||30"]["sales"] = []
        }
      }

      // 收集數值
      for (const valName in valueAggs) {
        result[rowKey][colKey][valName].push(row[valName]);
        // result["A||North||150||30"]["A||North||150||30"]["sales"] = [150,200]
      }
    });

    // 應用彙總函式
    for (const rowKey in result) {
      for (const colKey in result[rowKey]) {
        for (const valName in valueAggs) {
          // rowkey = "A||North||150||30"
          // colKey = "A||North||150||30"
          // valName = "sales"
          const values = result[rowKey][colKey][valName];
          // values = [150,200]
          result[rowKey][colKey][valName] = valueAggs[valName](values);
          // result["A||North||150||30"]["A||North||150||30"] = 350
        }
      }
    }

    let rowKeys = Object.keys(rowKeysObj).sort();
    let colKeys = Object.keys(colKeysObj).sort();

    return {
      result,
      rowKeys,
      colKeys
    };
  }
}
