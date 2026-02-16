
import { Lesson } from './types';

export const py_basic_stage8: Lesson = {
  id: 'py8',
  title: 'STEP 8. 함수 (Function)',
  description: '반복되는 코드를 묶어서 재사용하는 법을 배웁니다.',
  category: 'language',
  status: 'locked',
  pages: [
    {
      id: 'py8_p1',
      title: '1. 함수 정의 (def)',
      content:
        '함수는 특정 기능을 수행하는 코드의 묶음입니다. def 키워드를 사용하여 정의하며, 한 번 만들어두면 필요할 때마다 이름을 불러서 실행(호출)할 수 있습니다.',
      code: 'def greet():\n    print("안녕하세요!")\n\ngreet()',
      exampleOutput: '안녕하세요!',
      traceFlow: [0, 1, 3],
      variableHistory: [
        {},
        {},
        {}
      ],
      explanations: [
        { id: 'ex8_1', codeLine: 0, title: '함수 정의', text: 'def는 "define"의 약자로, 함수를 만들겠다는 시작 선언입니다.', type: 'blue', badge: 'def' },
        { id: 'ex8_2', codeLine: 1, title: '함수 내용', text: '함수가 호출되었을 때 실행할 코드를 들여쓰기해서 작성합니다.', type: 'green', badge: '1' },
        { id: 'ex8_3', codeLine: 3, title: '함수 호출', text: '함수 이름 뒤에 괄호를 붙여 실제로 기능을 실행시킵니다.', type: 'orange', badge: '2' }
      ]
    },

    {
      id: 'py8_p2',
      title: '2. 매개변수와 반환값',
      content:
        '함수에 데이터를 전달할 때는 "매개변수"를 사용하고, 실행 결과를 밖으로 돌려줄 때는 "return"을 사용합니다.',
      code: 'def add(a, b):\n    return a + b\n\nresult = add(10, 20)\nprint(result)',
      exampleOutput: '30',
      traceFlow: [0, 1, 3, 4],
      variableHistory: [
        {},
        {},
        { result: 30 },
        { result: 30 }
      ],
      explanations: [
        { id: 'ex8_4', codeLine: 0, title: '매개변수', text: '함수가 입력받을 값들의 이름을 정합니다 (a, b).', type: 'purple', badge: 'in' },
        { id: 'ex8_5', codeLine: 1, title: '반환 (return)', text: '계산된 결과값을 함수 밖으로 던져줍니다.', type: 'yellow', badge: 'out' },
        { id: 'ex8_6', codeLine: 3, title: '결과 저장', text: 'add(10, 20)이 돌려준 30이라는 값을 result 변수에 담습니다.', type: 'green', badge: '3' }
      ]
    },

    {
      id: 'py8_p3',
      title: '3. return의 특징',
      content:
        'return은 값을 반환하는 역할도 하지만, 함수를 그 즉시 종료시키는 역할도 합니다. return 뒤에 오는 코드는 실행되지 않습니다.',
      code: 'def check(x):\n    if x > 0:\n        return "양수"\n    return "0 또는 음수"',
      exampleOutput: 'check(3) → "양수"\ncheck(-1) → "0 또는 음수"',
      traceFlow: [0, 1, 2, 3],
      variableHistory: [
        {},
        {},
        {},
        {}
      ],
      explanations: [
        { id: 'ex8_7', codeLine: 1, title: '조건 확인', text: 'x가 0보다 큰지 확인합니다.', type: 'blue', badge: 'if' },
        { id: 'ex8_8', codeLine: 2, title: '즉시 종료', text: '조건이 맞으면 "양수"를 반환하고 함수를 바로 끝냅니다.', type: 'red', badge: '!' },
        { id: 'ex8_9', codeLine: 3, title: '나머지 경우', text: '위의 return이 실행되지 않았을 때만 이 줄까지 내려와 실행됩니다.', type: 'orange', badge: 'else' }
      ]
    },

    {
      id: 'py8_p4',
      title: '4. return 없는 함수의 반환값',
      content:
        '함수에 return 문이 없으면 파이썬은 자동으로 None이라는 특별한 값을 반환합니다. None은 "값이 없음"을 의미하는 파이썬의 예약어입니다.',
      code: 'def say_hello():\n    print("Hello")\n\nresult = say_hello()\nprint(result)',
      exampleOutput: 'Hello\nNone',
      traceFlow: [0, 1, 3, 4],
      variableHistory: [
        {},
        {},
        { result: undefined },
        { result: undefined }
      ],
      explanations: [
        { id: 'ex8_10', codeLine: 0, title: '출력 전용 함수', text: '출력(print)만 수행하고 결과를 반환(return)하지 않는 함수입니다.', type: 'blue', badge: 'def' },
        { id: 'ex8_11', codeLine: 3, title: '호출 및 저장', text: '함수가 실행된 후 돌려받는 값을 result에 저장합니다.', type: 'orange', badge: 'call' },
        { id: 'ex8_12', codeLine: 4, title: 'None 확인', text: 'return이 명시되지 않았으므로 result에는 None이 출력됩니다.', type: 'green', badge: 'None' }
      ]
    }
  ],
  conceptProblems: [
    {
      id: 'py8_c1',
      question: 'Q1. 함수의 가장 중요한 목적은 무엇인가요?',
      options: ['프로그램을 느리게 만들기 위해', '코드를 복잡하게 만들기 위해', '코드를 재사용하고 정리하기 위해', '변수 개수를 늘리기 위해'],
      answer: '코드를 재사용하고 정리하기 위해',
      hint: '똑같은 코드를 여러 번 쓸 때 유용합니다.',
      explanation: '함수는 반복되는 로직을 하나로 묶어 코드의 재사용성을 높이고 구조를 깔끔하게 만듭니다.',
      type: 'concept'
    },
    {
      id: 'py8_c2',
      question: 'Q2. 다음 중 함수 정의에 사용하는 키워드는 무엇인가요?',
      options: ['if', 'for', 'def', 'return'],
      answer: 'def',
      hint: 'define의 약자입니다.',
      explanation: '파이썬에서 함수를 정의할 때는 def 키워드를 사용합니다.',
      type: 'concept'
    },
    {
      id: 'py8_c3',
      question: 'Q3. 다음 코드의 실행 결과는 무엇인가요?\ndef add(a, b):\n    return a + b\nprint(add(2, 3))',
      options: ['2', '3', '5', 'None'],
      answer: '5',
      hint: '2와 3이 매개변수로 들어가 더해집니다.',
      explanation: 'add(2, 3)은 2 + 3의 결과인 5를 반환하므로 5가 출력됩니다.',
      type: 'concept'
    },
    {
      id: 'py8_c4',
      question: 'Q4. return 문에 대한 설명으로 올바른 것은 무엇인가요?',
      options: [
        '함수 안에서만 사용할 수 없다',
        'return 뒤의 코드는 항상 실행된다',
        'return은 값을 화면에 출력한다',
        'return을 만나면 함수가 즉시 종료된다'
      ],
      answer: 'return을 만나면 함수가 즉시 종료된다',
      hint: '함수의 "탈출구" 역할을 생각해보세요.',
      explanation: 'return은 호출한 곳으로 값을 돌려주면서 동시에 함수의 실행을 완전히 끝냅니다.',
      type: 'concept'
    },
    {
      id: 'py8_c5',
      question: 'Q5. 파이썬에서 return 문이 없는 함수가 실행을 마친 뒤 반환하는 값은 무엇인가요?',
      options: ['0', 'False', '""', 'None'],
      answer: 'None',
      hint: '파이썬에서 "값이 없음"을 나타내는 특별한 단어를 생각해보세요.',
      explanation: '파이썬 함수는 return 문이 명시되지 않으면 자동으로 None을 반환합니다.',
      type: 'concept'
    }
  ],
  codingProblems: [
    {
      id: 'py8_cp1',
      question: '문제 1. 두 정수를 매개변수로 받아 그 합을 반환하는 함수 add를 정의하시오.',
      answer: 'def add(a, b):\n    return a + b',
      hint: 'def add(a, b): 로 시작하고 return을 사용하세요.',
      type: 'coding'
    },
    {
      id: 'py8_cp2',
      question: '문제 2. 정수 하나를 매개변수로 받아 짝수이면 True, 홀수이면 False를 반환하는 함수 is_even을 정의하시오.',
      answer: 'def is_even(n):\n    if n % 2 == 0:\n        return True\n    else:\n        return False',
      hint: 'if문과 % 연산자를 함수 안에서 사용하세요.',
      type: 'coding'
    },
    {
      id: 'py8_cp3',
      question: '문제 3. 리스트를 매개변수로 받아 모든 원소의 합을 반환하는 함수 total_sum을 정의하시오.',
      answer: 'def total_sum(nums):\n    total = 0\n    for n in nums:\n        total += n\n    return total',
      hint: '반복문으로 리스트를 돌면서 값을 누적하고 마지막에 return 하세요.',
      type: 'coding'
    },
    {
      id: 'py8_cp4',
      question: '문제 4. "StepCode"라고 출력만 하고 아무것도 반환하지 않는(return이 없는) 함수 show_step을 정의하고 호출하시오.',
      answer: 'def show_step():\n    print("StepCode")\n\nshow_step()',
      hint: 'def 키워드로 함수를 만들고 print만 작성하세요. 마지막에 함수를 호출하는 것도 잊지 마세요.',
      type: 'coding',
      exampleOutput: 'StepCode'
    }
  ]
};
