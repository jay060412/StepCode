
import { Lesson } from './types';

export const py_basic_stage1: Lesson = {
  id: 'py1',
  title: 'STEP 1. 출력 & 변수',
  description: '코딩의 시작, 화면에 출력하고 값을 담는 법을 배웁니다.',
  category: 'language',
  status: 'current',
  pages: [
    {
      id: 'py1_p1',
      title: '1. 출력 (print)',
      content:
        'print() 함수는 값을 화면(콘솔)에 출력합니다. 컴퓨터에게 우리가 원하는 정보를 보여달라고 명령하는 가장 기본적인 방법입니다.',
      code: 'print("Hello")\nprint(10)',
      exampleOutput: 'Hello\n10',
      traceFlow: [0, 1],
      explanations: [
        {
          id: 'ex1',
          codeLine: 0,
          title: '문자열 출력',
          text: '"Hello"라는 글자를 화면에 그대로 보여줍니다.',
          type: 'blue',
          badge: '1'
        },
        {
          id: 'ex2',
          codeLine: 1,
          title: '숫자 출력',
          text: '10이라는 정수 값을 화면에 보여줍니다.',
          type: 'yellow',
          badge: '2'
        }
      ]
    },

    {
      id: 'py1_p2',
      title: '2. 변수',
      content:
        '변수는 값을 저장하는 이름입니다. = 기호는 "같다"가 아니라 오른쪽의 값을 왼쪽의 이름에 집어넣는 "대입"을 의미합니다.',
      code: 'name = "지니"\nage = 17\nprint(name)\nprint(age)',
      exampleOutput: '지니\n17',
      traceFlow: [0, 1, 2, 3],
      variableHistory: [
        { "name": "지니" },
        { "name": "지니", "age": 17 },
        { "name": "지니", "age": 17 },
        { "name": "지니", "age": 17 }
      ],
      explanations: [
        {
          id: 'ex3',
          codeLine: 0,
          title: '문자열 변수',
          text: '"지니"라는 텍스트를 name이라는 상자에 담습니다.',
          type: 'purple',
          badge: '1'
        },
        {
          id: 'ex4',
          codeLine: 1,
          title: '정수 변수',
          text: '17이라는 숫자를 age라는 상자에 담습니다.',
          type: 'orange',
          badge: '2'
        }
      ]
    },

    {
      id: 'py1_p3',
      title: '3. 여러 값 출력과 연산 출력',
      content:
        'print(a, b)는 여러 값을 출력하는 방식이고, print(a + b)는 두 값을 더한 연산 결과를 출력합니다. 이 둘은 완전히 다른 동작입니다.\n(로직 흐름 추적에서 a, b변수가 중간에 없어지는건 이해를 돕기 위해서지 실제로는 a, b변수는 그대로 살아있습니다.)',
      code:
        'a = 3\nb = 5\nprint(a, b)\nprint(a + b)\n\nx = "3"\ny = "5"\nprint(x, y)\nprint(x + y)',
      exampleOutput: '3 5\n8\n3 5\n35',
      traceFlow: [0, 1, 2, 3, 5, 6, 7, 8],
      variableHistory: [
        { "a": 3 },
        { "a": 3, "b": 5 },
        { "a": 3, "b": 5 },
        { "a": 3, "b": 5 },
        { "x": "3" },
        { "x": "3", "y": "5" },
        { "x": "3", "y": "5" },
        { "x": "3", "y": "5" }
      ],
      explanations: [
        {
          id: 'ex5',
          codeLine: 2,
          title: '여러 값 출력',
          text: '쉼표로 구분된 값들은 공백을 사이에 두고 출력됩니다.',
          type: 'blue',
          badge: '1'
        },
        {
          id: 'ex6',
          codeLine: 3,
          title: '연산 결과 출력',
          text: '숫자끼리는 더해지고, 문자열끼리는 이어 붙여집니다.\n연산은 이렇게 있습니다. + 더하기, - 빼기, * 곱하기, / 나누기, // 몫, % 나머지, ** 제곱',
          type: 'red',
          badge: '2'
        },
        {
          id: 'ex6-1',
          codeLine: 8,
          title: '연산 결과 출력',
          text: '엇? 연산결과가 위와 다르죠? 차이점은 자료형 차이입니다. 위에 연산에서 쓰인 자료형은 정수이고 여기서는 문자열입니다. 따라서 3+5의 더한값이 아닌 그저 문자를 옆에 붙이게 된겁니다. 자세한 내용은 뒤에서 계속됩니다.',
          type: 'green',
          badge: '3'
        }
      ]
    },

    {
      id: 'py1_p4',
      title: '4. print 옵션 (sep, end)',
      content:
        'print() 함수는 출력 형식을 제어하는 옵션을 제공합니다. sep은 값 사이의 구분자, end는 출력이 끝날 때 붙는 문자열입니다.',
      code:
        'print(1, 2, 3)\nprint(1, 2, 3, sep=",")\nprint("A", end="")\nprint("B")',
      exampleOutput: '1 2 3\n1,2,3\nAB',
      traceFlow: [0, 1, 2, 3],
      explanations: [
        {
          id: 'ex7',
          codeLine: 1,
          title: 'sep 옵션',
          text: '값 사이의 구분자를 쉼표로 변경합니다. sep의 기본값은 " "즉 띄어쓰기입니다. 따라서 첫번째줄 출력값이 "1 2 3"인겁니다.',
          type: 'green',
          badge: '1'
        },
        {
          id: 'ex8',
          codeLine: 2,
          title: 'end 옵션',
          text: '줄바꿈 대신 빈 문자열을 사용해 같은 줄에 출력합니다. end의 기본값은 "\\n"즉 엔터 입니다. 따라서 출력값이"1 2 3[엔터]1,2,3..."인겁니다.',
          type: 'yellow',
          badge: '2'
        }
      ]
    },

    {
      id: 'py1_p5',
      title: '5. f-string 출력',
      content:
        'f-string은 문자열 앞에 f를 붙이고 {변수} 형태로 변수 값을 문자열 안에 직접 삽입하는 출력 방식입니다.',
      code:
        'name = "지니"\nage = 20\nprint(f"이름은 {name}이고 나이는 {age}살입니다.")\nprint("이름은"+int())',
      exampleOutput: '이름은 지니이고 나이는 20살입니다.',
      traceFlow: [0, 1, 2],
      variableHistory: [
        { "name": "지니" },
        { "name": "지니", "age": 20 },
        { "name": "지니", "age": 20 }
      ],
      explanations: [
        {
          id: 'ex9',
          codeLine: 2,
          title: 'f-string',
          text: '중괄호 안의 변수가 실제 값으로 바뀌어 출력됩니다.',
          type: 'purple',
          badge: '1'
        }
      ]
    },

    {
      id: 'py1_p6',
      title: '6. 자료형 (Data Type)',
      content:
        '자료형은 값의 종류를 의미합니다.\n' +
        '파이썬은 값을 보고 자동으로 자료형을 결정합니다.\n\n' +
        '- int  : 정수 (1, 10, -3)\n' +
        '- float: 실수 (3.14, 0.5)\n' +
        '- str  : 문자열 ("Hello")\n' +
        '- bool : 참/거짓 (True, False)\n\n' +
        '(type() 함수와 로직 흐름 추적을 함께 확인하세요!)',
      code:
        'a = 10\n' +
        'b = 3.14\n' +
        'c = "Python"\n' +
        'd = True\n\n' +
        'print(type(a))\n' +
        'print(type(b))\n' +
        'print(type(c))\n' +
        'print(type(d))',
      exampleOutput:
        "<class 'int'>\n" +
        "<class 'float'>\n" +
        "<class 'str'>\n" +
        "<class 'bool'>",
      traceFlow: [0, 1, 2, 3, 5, 6, 7, 8],
      variableHistory: [
        {},
        { a: 10 },
        { a: 10, b: 3.14 },
        { a: 10, b: 3.14, c: 'Python' },
        { a: 10, b: 3.14, c: 'Python', d: true },
        { a: 10, b: 3.14, c: 'Python', d: true },
        { a: 10, b: 3.14, c: 'Python', d: true },
        { a: 10, b: 3.14, c: 'Python', d: true },
        { a: 10, b: 3.14, c: 'Python', d: true }
      ],
      explanations: [
        {
          id: 'ex1_10',
          codeLine: 0,
          title: '정수 (int)',
          text: '10은 소수점이 없는 정수형(int) 자료입니다.',
          type: 'blue',
          badge: 'int'
        },
        {
          id: 'ex1_11',
          codeLine: 1,
          title: '실수 (float)',
          text: '3.14는 소수점을 가진 실수형(float) 자료입니다.',
          type: 'orange',
          badge: 'float'
        },
        {
          id: 'ex1_12',
          codeLine: 2,
          title: '문자열 (str)',
          text: '"Python"은 글자를 저장하는 문자열(str) 자료형입니다.',
          type: 'purple',
          badge: 'str'
        },
        {
          id: 'ex1_13',
          codeLine: 3,
          title: '불리언 (bool)',
          text: 'True는 참(True)을 의미하는 불리언(bool) 자료형입니다.',
          type: 'green',
          badge: 'bool'
        }
      ]
    }

  ],

  conceptProblems: [
    {
      id: 'py1_c1',
      question: 'Q1. print() 함수의 역할로 가장 알맞은 것은?',
      options: [
        '값을 입력받는다',
        '값을 화면에 출력한다',
        '값을 계산한다',
        '값을 저장한다'
      ],
      answer: '값을 화면에 출력한다',
      hint: '화면에 결과를 보여줄 때 사용합니다.',
      explanation: 'print()는 표준 출력 함수로, 데이터를 화면에 표시합니다.',
      type: 'concept'
    },
    {
      id: 'py1_c2',
      question: 'Q2. print(a, b)와 print(a + b)의 차이로 올바른 것은?',
      options: [
        '둘은 완전히 같다',
        'print(a, b)는 연산이다',
        'print(a + b)는 연산 결과를 출력한다',
        'print(a + b)는 항상 에러가 난다'
      ],
      answer: 'print(a + b)는 연산 결과를 출력한다',
      hint: '더하기 연산이 실제로 수행되는지 생각해보세요.',
      explanation:
        'print(a, b)는 여러 값을 출력하고, print(a + b)는 더하기 연산을 수행합니다.',
      type: 'concept'
    },
    {
      id: 'py1_c3',
      question: 'Q3. f-string에 대한 설명으로 올바른 것은?',
      options: [
        '문자열을 입력받는 방법이다',
        '문자열 앞에 f를 붙이고 변수를 {}로 넣는다',
        '숫자만 출력할 수 있다',
        'print 없이 자동 출력된다'
      ],
      answer: '문자열 앞에 f를 붙이고 변수를 {}로 넣는다',
      hint: '문자열 안에 변수를 넣는 방법입니다.',
      explanation:
        'f-string은 문자열 포맷 방식으로, 중괄호 안에 변수를 넣어 출력합니다.',
      type: 'concept'
    }
  ],

  codingProblems: [
    {
      id: 'py1_cp1',
      question: '문제 1. 다음 문장을 출력하시오.\nHello, Python!',
      answer: 'print("Hello, Python!")',
      hint: 'print() 함수와 문자열을 활용하세요.',
      type: 'coding',
      exampleOutput: 'Hello, Python!'
    },
    {
      id: 'py1_cp2',
      question:
        '문제 2. 변수 name에 자신의 이름을 저장하고\nf-string을 사용해 다음과 같이 출력하시오.\n\n안녕하세요, ○○님!',
      answer: 'name = "지니"\nprint(f"안녕하세요, {name}님!")',
      hint: 'f-string과 중괄호를 사용하세요.',
      type: 'coding',
      exampleOutput: '안녕하세요, 지니님!'
    }
  ]
};
