
import { Lesson } from './types';

export const py_basic_stage3: Lesson = {
  id: 'py3',
  title: 'STEP 3. 연산자',
  description: '다양한 기호를 사용하여 계산하고 값을 비교하는 법을 배웁니다.',
  category: 'language',
  status: 'locked',
  pages: [
    {
      id: 'py3_p1',
      title: '1. 산술 연산자',
      content:
        '기본적인 사칙연산 외에도 파이썬에는 몫(//), 나머지(%), 거듭제곱(**) 등의 특별한 연산자가 있습니다.',
      code: 'a = 10\nb = 3\nprint(a + b)\nprint(a // b)\nprint(a % b)',
      exampleOutput: '13\n3\n1',
      traceFlow: [0, 1, 2, 3, 4],
      variableHistory: [
        { a: 10 },
        { a: 10, b: 3 },
        { a: 10, b: 3 },
        { a: 10, b: 3 },
        { a: 10, b: 3 }
      ],
      explanations: [
        { id: 'ex3_1', codeLine: 2, title: '덧셈', text: '10 + 3 = 13이 출력됩니다.', type: 'blue', badge: '+' },
        { id: 'ex3_2', codeLine: 3, title: '몫 (정수)', text: '10을 3으로 나눈 정수 몫인 3이 출력됩니다.', type: 'orange', badge: '//' },
        { id: 'ex3_3', codeLine: 4, title: '나머지', text: '10을 3으로 나눈 나머지인 1이 출력됩니다.', type: 'yellow', badge: '%' }
      ]
    },

    {
      id: 'py3_p2',
      title: '2. 비교 연산자',
      content:
        '두 값을 비교할 때 사용하며, 그 결과는 항상 참(True) 또는 거짓(False)인 bool 자료형으로 나타납니다.',
      code: 'print(10 > 3)\nprint(10 == 3)\nprint(10 != 3)',
      exampleOutput: 'True\nFalse\nTrue',
      traceFlow: [0, 1, 2],
      variableHistory: [{}, {}, {}],
      explanations: [
        { id: 'ex3_4', codeLine: 0, title: '크다', text: '10이 3보다 크므로 True가 출력됩니다.', type: 'green', badge: '>' },
        { id: 'ex3_5', codeLine: 1, title: '같다', text: '10과 3은 다르므로 False가 출력됩니다.', type: 'red', badge: '==' },
        { id: 'ex3_6', codeLine: 2, title: '다르다', text: '10과 3은 다르므로 True가 출력됩니다.', type: 'purple', badge: '!=' }
      ]
    },

    {
      id: 'py3_p3',
      title: '3. 논리 연산자',
      content:
        '여러 조건을 결합하거나 조건의 결과를 반전시킬 때 사용합니다.\n- and: 둘 다 참이어야 True\n- or: 하나만 참이어도 True\n- not: 결과를 반대로 (True -> False)',
      code:
        'x = 10\nprint(x > 5 and x < 20)\nprint(x < 5 or x > 20)\nprint(not False)',
      exampleOutput: 'True\nFalse\nTrue',
      traceFlow: [0, 1, 2, 3],
      variableHistory: [
        { x: 10 },
        { x: 10 },
        { x: 10 },
        { x: 10 }
      ],
      explanations: [
        { id: 'ex3_7', codeLine: 1, title: 'AND 연산', text: '10은 5보다 크고 20보다 작으므로 True입니다.', type: 'blue', badge: 'and' },
        { id: 'ex3_8', codeLine: 2, title: 'OR 연산', text: '둘 다 거짓이므로 False입니다.', type: 'orange', badge: 'or' },
        { id: 'ex3_9', codeLine: 3, title: 'NOT 연산', text: 'False의 반대인 True가 출력됩니다.', type: 'green', badge: 'not' }
      ]
    },

    {
      id: 'py3_p4',
      title: '4. 연산자 우선순위',
      content:
        '파이썬은 수학처럼 연산자에 따라 계산 순서가 정해져 있습니다. 괄호를 사용하면 계산 순서를 명시적으로 바꿀 수 있습니다.\n\n순서: 괄호 () > 곱셈/나눗셈 (*, /) > 덧셈/뺄셈 (+, -)',
      code: 'print(2 + 3 * 4)\nprint((2 + 3) * 4)',
      exampleOutput: '14\n20',
      traceFlow: [0, 1],
      variableHistory: [{}, {}],
      explanations: [
        { id: 'ex3_10', codeLine: 0, title: '기본 순서', text: '곱셈이 덧셈보다 먼저 수행됩니다. 2 + (3 * 4) = 14', type: 'orange', badge: '1' },
        { id: 'ex3_11', codeLine: 1, title: '괄호 사용', text: '괄호 안의 덧셈이 먼저 수행됩니다. (5) * 4 = 20', type: 'blue', badge: '()' }
      ]
    },

    {
      id: 'py3_p5',
      title: '5. 복합 대입 연산자',
      content:
        '복합 대입 연산자는 연산과 대입을 한 번에 수행합니다. 코드를 더 짧고 간결하게 만들어줍니다.\n예: x += 1 은 x = x + 1 과 같은 의미입니다.',
      code:
        'x = 10\nx += 5\nprint(x)\n\nx *= 2\nprint(x)',
      exampleOutput: '15\n30',
      traceFlow: [0, 1, 2, 4, 5],
      variableHistory: [
        { x: 10 },
        { x: 15 },
        { x: 15 },
        { x: 30 },
        { x: 30 }
      ],
      explanations: [
        { id: 'ex3_12', codeLine: 1, title: '덧셈 후 대입', text: 'x에 5를 더한 뒤 다시 x에 저장합니다. (10 + 5 = 15)', type: 'blue', badge: '+=' },
        { id: 'ex3_13', codeLine: 4, title: '곱셈 후 대입', text: '현재 x(15)에 2를 곱한 뒤 저장합니다. (15 * 2 = 30)', type: 'orange', badge: '*=' }
      ]
    }
  ],
  conceptProblems: [
    {
      id: 'py3_c1',
      question: 'Q1. 다음 중 나눗셈의 몫(정수)만 구하는 연산자는 무엇인가요?',
      options: ['/', '%', '//', '**'],
      answer: '//',
      hint: '슬래시(/)를 두 번 사용합니다.',
      explanation: '// 연산자는 소수점을 버리고 정수 부분의 몫만 구합니다.',
      type: 'concept'
    },
    {
      id: 'py3_c2',
      question: 'Q2. 다음 코드의 출력 결과는 무엇인가요?\nprint(10 % 3)',
      options: ['0', '1', '3', '에러'],
      answer: '1',
      hint: '10을 3으로 나누었을 때 남는 값을 생각해보세요.',
      explanation: '10을 3으로 나누면 몫은 3이고 나머지는 1입니다.',
      type: 'concept'
    },
    {
      id: 'py3_c3',
      question: 'Q3. 다음 비교 연산의 결과로 올바른 것은 무엇인가요?\n5 > 3',
      options: ['5', '3', 'True', 'False'],
      answer: 'True',
      hint: '5는 3보다 큰 것이 사실인가요?',
      explanation: '5가 3보다 크다는 조건은 참이므로 True가 결과가 됩니다.',
      type: 'concept'
    },
    {
      id: 'py3_c4',
      question: 'Q4. 다음 중 결과가 False인 것은 무엇인가요?',
      options: ['True and True', 'True or False', 'not False', 'False and True'],
      answer: 'False and True',
      hint: 'and 연산자는 양쪽이 모두 참이어야 합니다.',
      explanation: 'and 연산에서 하나라도 False가 있으면 전체 결과는 False가 됩니다.',
      type: 'concept'
    },
    {
      id: 'py3_c5',
      question: 'Q5. 다음 중 가장 먼저 계산되는 연산자는 무엇인가요?',
      options: ['+', '-', '*', '=='],
      answer: '*',
      hint: '곱셈과 나눗셈은 덧셈과 뺄셈보다 먼저 수행됩니다.',
      explanation: '산술 연산자 중 곱셈(*)과 나눗셈(/, //, %)은 덧셈(+)과 뺄셈(-)보다 우선순위가 높습니다.',
      type: 'concept'
    },
    {
      id: 'py3_c6',
      question: 'Q6. 다음 중 x = x + 3 과 같은 의미를 가진 코드는 무엇인가요?',
      options: ['x =+ 3', 'x == 3', 'x += 3', 'x ++'],
      answer: 'x += 3',
      hint: '더하기(+)와 대입(=)을 합친 기호를 찾아보세요.',
      explanation: '+= 연산자는 왼쪽 변수에 오른쪽 값을 더한 후 다시 그 변수에 저장합니다.',
      type: 'concept'
    }
  ],
  codingProblems: [
    {
      id: 'py3_cp1',
      question: '문제 1. 정수 a = 15, b = 4를 만들고 아래 결과를 순서대로 출력하시오.\n1. a + b\n2. a // b\n3. a % b',
      answer: 'a = 15\nb = 4\nprint(a + b)\nprint(a // b)\nprint(a % b)',
      hint: '변수를 먼저 선언하고 연산자를 사용해 print 하세요.',
      type: 'coding',
      exampleOutput: '19\n3\n3'
    },
    {
      id: 'py3_cp2',
      question: '문제 2. 정수 하나를 입력받아 10보다 크면 True, 아니면 False를 출력하시오.',
      answer: 'x = int(input())\nprint(x > 10)',
      hint: '입력받은 값을 숫자로 바꾸고 비교 연산자를 사용하세요.',
      type: 'coding',
      exampleInput: '15',
      exampleOutput: 'True'
    },
    {
      id: 'py3_cp3',
      question: '문제 3. 정수 하나를 입력받아 다음 조건을 모두 만족하면 True를 출력하시오.\n- 입력한 수가 5보다 크다\n- 입력한 수가 20보다 작다',
      answer: 'x = int(input())\nprint(x > 5 and x < 20)',
      hint: 'and 연산자를 사용하여 두 조건을 결합하세요.',
      type: 'coding',
      exampleInput: '12',
      exampleOutput: 'True'
    },
    {
      id: 'py3_cp4',
      question: '문제 4. 2 + 3 * 4 식에 괄호를 적절히 사용하여 출력 결과가 20이 되도록 코드를 작성하시오.',
      answer: 'print((2 + 3) * 4)',
      hint: '더하기 부분을 괄호로 감싸보세요.',
      type: 'coding',
      exampleOutput: '20'
    },
    {
      id: 'py3_cp5',
      question: '문제 5. 변수 total을 0으로 시작하여, 반복문을 사용하지 않고 복합 대입 연산자(+=)를 사용해 1부터 5까지 더한 결과를 출력하시오.',
      answer: 'total = 0\ntotal += 1\ntotal += 2\ntotal += 3\ntotal += 4\ntotal += 5\nprint(total)',
      hint: 'total += 1, total += 2 ... 형식으로 작성하세요.',
      type: 'coding',
      exampleOutput: '15'
    }
  ]
};
