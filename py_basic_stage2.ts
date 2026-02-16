import { Lesson } from './types';

export const py_basic_stage2: Lesson = {
  id: 'py2',
  title: 'STEP 2. 입력 & 형 변환',
  description: '사용자와 소통하고 데이터의 형태를 바꾸는 법을 배웁니다.',
  category: 'language',
  status: 'locked',
  pages: [
    {
      id: 'py2_p1',
      title: '1. 입력 (input)',
      content:
        'input() 함수는 사용자로부터 값을 입력받을 때 사용합니다. 중요한 점은 입력받은 값이 항상 "문자열(str)"로 취급된다는 것입니다. \n만약 입력을 받을때 입력창을 제작하고싶다면 input("이름을 입력하세요: ")로도 가능합니다.',
      code: 'x = input()\nprint(x)',
      exampleOutput: '지니',
      traceFlow: [0, 1],
      variableHistory: [
        { x: '지니' },
        { x: '지니' }
      ],
      explanations: [
        { id: 'ex2_1', codeLine: 0, title: '입력받기', text: '프로그램이 멈추고 사용자의 입력을 기다립니다.', type: 'blue', badge: '1' },
        { id: 'ex2_2', codeLine: 1, title: '출력하기', text: '입력받아 x에 저장된 값을 화면에 보여줍니다.', type: 'green', badge: '2' }
      ]
    },

    {
      id: 'py2_p2_extra',
      title: '2. 공백이 포함된 입력',
      content:
        'input() 함수는 엔터(Enter)를 치기 전까지의 줄 전체를 하나의 문자열로 입력받습니다. 중간에 공백(띄어쓰기)이 포함되어 있어도 하나의 덩어리로 처리됩니다.',
      code: 'text = input()\nprint(text)',
      exampleOutput: 'Hello World',
      traceFlow: [0, 1],
      variableHistory: [
        { text: 'Hello World' },
        { text: 'Hello World' }
      ],
      explanations: [
        { id: 'ex2_s1', codeLine: 0, title: '전체 입력', text: '"Hello World"라고 입력하면 공백을 포함한 전체가 저장됩니다.', type: 'blue', badge: 'str' },
        { id: 'ex2_s2', codeLine: 1, title: '그대로 출력', text: '입력받은 문장이 쪼개지지 않고 그대로 출력됩니다.', type: 'green', badge: '1' }
      ]
    },

    {
      id: 'py2_p2',
      title: '3. 형 변환 (Casting)',
      content:
        '문자열은 숫자가 아니어서 계산할 수 없습니다. 숫자로 계산하려면 형 변환 함수가 필요합니다.\n- int(): 정수로 변환\n- float(): 실수로 변환\n- str(): 문자열로 변환',
      code: 'a = int(input())\nb = int(input())\nprint(a + b)',
      exampleOutput: '30',
      traceFlow: [0, 1, 2],
      variableHistory: [
        { a: 10 },
        { a: 10, b: 20 },
        { a: 10, b: 20 }
      ],
      explanations: [
        { id: 'ex2_3', codeLine: 0, title: '정수 변환', text: '입력받은 문자열을 정수(int)로 바꿉니다.', type: 'orange', badge: '1' },
        { id: 'ex2_4', codeLine: 1, title: '정수 변환', text: '두 번째 입력값도 정수로 바꿉니다.', type: 'orange', badge: '2' },
        { id: 'ex2_5', codeLine: 2, title: '덧셈 연산', text: '이제 숫자가 되었으므로 수학적인 덧셈이 가능합니다.', type: 'yellow', badge: '3' }
      ]
    },

    {
      id: 'py2_p3',
      title: '4. 입력 처리 흐름',
      content:
        '대부분의 데이터 처리는 [입력 → 변환 → 처리]의 순서를 따릅니다.',
      code: 'age = int(input())\nnext_age = age + 1\nprint(next_age)',
      exampleOutput: '18',
      traceFlow: [0, 1, 2],
      variableHistory: [
        { age: 17 },
        { age: 17, next_age: 18 },
        { age: 17, next_age: 18 }
      ],
      explanations: [
        { id: 'ex2_6', codeLine: 0, title: 'Step 1: 입력', text: '사용자의 나이를 입력받아 숫자로 바꿉니다.', type: 'blue', badge: '1' },
        { id: 'ex2_7', codeLine: 1, title: 'Step 2: 처리', text: '입력받은 값에 1을 더해 내년 나이를 구합니다.', type: 'purple', badge: '2' },
        { id: 'ex2_8', codeLine: 2, title: 'Step 3: 출력', text: '결과를 사용자에게 보여줍니다.', type: 'green', badge: '3' }
      ]
    },

    {
      id: 'py2_p4',
      title: '5. 여러 값 입력받기 (split / map)',
      content:
        'input().split()은 입력받은 문자열을 공백 기준으로 나누어 여러 개의 값을 한 번에 받을 수 있게 해줍니다.\n\nmap(자료형, 데이터)은 데이터 안의 모든 요소들을 지정한 자료형으로 한꺼번에 변환합니다.',
      code:
        'a, b = input().split()\nprint(a, b)\n\nx, y = map(int, input().split())\nprint(x + y)',
      exampleOutput: '10 20\n30',
      traceFlow: [0, 1, 3, 4],
      variableHistory: [
        { a: '10', b: '20' },
        { a: '10', b: '20' },
        { x: 10, y: 20 },
        { x: 10, y: 20 }
      ],
      explanations: [
        { id: 'ex2_9', codeLine: 0, title: 'split()', text: '공백을 기준으로 문자열을 쪼개어 a와 b에 각각 담습니다.', type: 'blue', badge: 'sp' },
        { id: 'ex2_10', codeLine: 3, title: 'map() 활용', text: '쪼개진 문자열들을 모두 int(정수)로 즉시 변환합니다.', type: 'orange', badge: 'map' },
        { id: 'ex2_11', codeLine: 4, title: '연산 결과', text: '정수로 변환되었으므로 산술 덧셈 결과가 출력됩니다.', type: 'green', badge: '+' }
      ]
    }
  ],

  conceptProblems: [
    {
      id: 'py2_c1',
      question: 'Q1. input() 함수로 입력받은 값의 기본 자료형은 무엇인가요?',
      options: ['int', 'float', 'str', 'bool'],
      answer: 'str',
      hint: '숫자를 입력해도 따옴표가 붙은 상태로 들어옵니다.',
      explanation: 'input()은 모든 입력을 문자열(str)로 받아들입니다.',
      type: 'concept'
    },
    {
      id: 'py2_c_extra',
      question: 'Q2. input()으로 "Hello World"를 입력했을 때 저장되는 값으로 올바른 것은?',
      options: ['"Hello"', '["Hello", "World"]', '"Hello World"', '에러'],
      answer: '"Hello World"',
      hint: 'input()은 한 줄 전체를 하나의 문자열로 가져옵니다.',
      explanation: 'split()을 쓰지 않으면 공백이 있어도 하나의 문자열로 처리됩니다.',
      type: 'concept'
    },
    {
      id: 'py2_c2',
      question: 'Q3. 다음 코드에서 에러가 발생하는 이유는 무엇인가요?\nx = input()\nprint(x + 1)',
      options: [
        'input()은 숫자를 못 받아서',
        '문자열과 정수는 더할 수 없어서',
        'print()는 계산을 못 해서',
        'x에 값이 저장되지 않아서'
      ],
      answer: '문자열과 정수는 더할 수 없어서',
      hint: 'x의 자료형과 1의 자료형을 비교해보세요.',
      explanation: 'x는 문자열이고 1은 정수이므로 서로 다른 자료형끼리는 더할 수 없습니다.',
      type: 'concept'
    },
    {
      id: 'py2_c3',
      question: 'Q4. int(input()) 코드가 실행되는 순서로 올바른 것은?',
      options: [
        '정수 변환 → 값 입력',
        '값 입력 → 정수 변환',
        '문자열 출력 → 정수 저장',
        '입력 없이 정수 생성'
      ],
      answer: '값 입력 → 정수 변환',
      hint: '괄호 안쪽이 먼저 실행됩니다.',
      explanation: '먼저 input()으로 값을 입력받은 뒤, 그 결과를 int()가 정수로 변환합니다.',
      type: 'concept'
    },
    {
      id: 'py2_c4',
      question: 'Q5. 다음 중 형 변환이 반드시 필요한 경우는 언제인가요?',
      options: [
        '문자열 두 개를 연결할 때',
        '정수 두 개를 더할 때',
        'input()으로 받은 값으로 계산할 때',
        'print()로 글자를 출력할 때'
      ],
      answer: 'input()으로 받은 값으로 계산할 때',
      hint: 'input()의 결과는 문자열이라는 점을 기억하세요.',
      explanation: '입력값은 문자열이므로 산술 연산을 하려면 숫자로 형 변환을 해야 합니다.',
      type: 'concept'
    },
    {
      id: 'py2_c5',
      question: 'Q6. a, b = input().split() 실행 후 a와 b의 자료형은 무엇인가요?',
      options: ['int', 'float', 'str', 'bool'],
      answer: 'str',
      hint: 'split()은 나누기만 할 뿐 자료형을 자동으로 바꾸지는 않습니다.',
      explanation: 'input().split()의 결과물은 항상 문자열 형태의 리스트 요소들입니다.',
      type: 'concept'
    }
  ],

  codingProblems: [
    {
      id: 'py2_cp_extra',
      question: '문제 1. 공백이 포함된 문장을 입력받아 그대로 출력하시오.',
      answer: 'text = input()\nprint(text)',
      hint: 'input() 함수는 공백을 포함한 한 줄 전체를 입력받습니다.',
      type: 'coding',
      exampleInput: 'Hello Python World',
      exampleOutput: 'Hello Python World'
    },
    {
      id: 'py2_cp1',
      question: '문제 2. 이름을 입력받아 아래와 같이 출력하시오.\n예시 입력: 지니\n출력: 안녕하세요 지니',
      answer: 'name = input()\nprint("안녕하세요", name)',
      hint: 'input()으로 이름을 받고, print()에서 쉼표로 구분해 출력하세요.',
      type: 'coding',
      exampleInput: '지니',
      exampleOutput: '안녕하세요 지니'
    },
    {
      id: 'py2_cp2',
      question: '문제 3. 정수 두 개를 각각 입력받아 그 합을 출력하시오.',
      answer: 'a = int(input())\nb = int(input())\nprint(a + b)',
      hint: '각각의 입력을 int()로 감싸서 숫자로 만들어야 합니다.',
      type: 'coding',
      exampleInput: '10\n20',
      exampleOutput: '30'
    },
    {
      id: 'py2_cp3',
      question: '문제 4. 나이를 입력받아 내년 나이를 계산하여 출력하시오.',
      answer: 'age = int(input())\nprint(age + 1)',
      hint: '나이를 숫자로 바꾼 뒤 1을 더하세요.',
      type: 'coding',
      exampleInput: '17',
      exampleOutput: '18'
    },
    {
      id: 'py2_cp4',
      question: '문제 5. 한 줄에 공백으로 구분되어 입력된 두 정수를 더한 결과를 출력하시오.',
      answer: 'a, b = map(int, input().split())\nprint(a + b)',
      hint: 'map(int, input().split()) 구문을 활용해 한 번에 정수로 변환하세요.',
      type: 'coding',
      exampleInput: '10 20',
      exampleOutput: '30'
    }
  ]
};
