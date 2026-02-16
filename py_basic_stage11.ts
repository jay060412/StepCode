
import { Lesson } from './types';

export const py_basic_stage11: Lesson = {
  id: 'py11',
  title: 'STEP 11. 예외 처리 & 모듈',
  description: '오류를 우아하게 처리하고 다른 사람이 만든 유용한 기능을 가져다 쓰는 법을 배웁니다.',
  category: 'language',
  status: 'locked',
  pages: [
    {
      id: 'py11_p1',
      title: '1. 예외 처리 (try / except)',
      content:
        '프로그램 실행 중 에러가 발생하면 프로그램이 즉시 멈춰버립니다. 이를 방지하고 에러 상황을 유연하게 넘기기 위해 try / except 문을 사용합니다.',
      code:
        'try:\n    x = int(input())\n    print(10 / x)\nexcept:\n    print("문제가 발생했습니다.")',
      exampleOutput: '문제가 발생했습니다. (에러 발생 시)',
      traceFlow: [0, 1, 2, 3],
      variableHistory: [
        {},
        { x: '입력값 (정수 변환 시도)' },
        { x: '입력값 (정상일 경우)' },
        {}
      ],
      explanations: [
        { id: 'ex11_1', codeLine: 0, title: '시도하기', text: '에러가 날 가능성이 있는 코드를 try 블록 안에 넣습니다.', type: 'blue', badge: 'try' },
        { id: 'ex11_2', codeLine: 2, title: '나누기 연산', text: '사용자가 0을 입력하거나 문자를 입력하면 에러가 발생합니다.', type: 'yellow', badge: '/' },
        { id: 'ex11_3', codeLine: 3, title: '에러 처리', text: '에러가 발생하면 프로그램이 종료되는 대신 이 블록이 실행됩니다.', type: 'red', badge: '!' }
      ]
    },
    {
      id: 'py11_p2',
      title: '2. 상세 예외 처리',
      content:
        '어떤 에러가 났는지에 따라 다르게 대처할 수 있습니다. 예를 들어 숫자가 아닌 값을 넣었을 때(ValueError)와 0으로 나눴을 때(ZeroDivisionError)를 구분할 수 있습니다.',
      code:
        'try:\n    n = int(input())\n    print(100 / n)\nexcept ValueError:\n    print("숫자만 입력하세요.")\nexcept ZeroDivisionError:\n    print("0으로 나눌 수 없습니다.")',
      exampleOutput: '숫자만 입력하세요. / 0으로 나눌 수 없습니다.',
      traceFlow: [0, 1, 2, 3, 5],
      variableHistory: [
        {},
        { n: '입력값 (정수 변환 시도)' },
        { n: '입력값 (정상일 경우)' },
        {},
        {}
      ],
      explanations: [
        { id: 'ex11_4', codeLine: 3, title: '값 에러', text: '문자를 입력해서 정수 변환에 실패했을 때 실행됩니다.', type: 'orange', badge: 'V' },
        { id: 'ex11_5', codeLine: 5, title: '0 나누기 에러', text: '숫자 0을 입력해서 나눗셈이 불가능할 때 실행됩니다.', type: 'purple', badge: 'Z' }
      ]
    },
    {
      id: 'py11_p3',
      title: '3. 모듈 (import)',
      content:
        '모듈은 미리 만들어진 기능의 묶음입니다. import 키워드를 사용하면 파이썬이 기본으로 제공하는 도구들이나 다른 사람이 만든 코드를 내 프로그램으로 가져올 수 있습니다.',
      code:
        'import random\n\nnum = random.randint(1, 10)\nprint(num)',
      exampleOutput: '1 ~ 10 사이의 임의의 숫자',
      traceFlow: [0, 2, 3],
      variableHistory: [
        {},
        { num: '랜덤 정수 (1~10)' },
        { num: '랜덤 정수 (1~10)' }
      ],
      explanations: [
        { id: 'ex11_6', codeLine: 0, title: '모듈 불러오기', text: '난수를 생성하는 기능을 가진 random 모듈을 가져옵니다.', type: 'green', badge: 'imp' },
        { id: 'ex11_7', codeLine: 2, title: '기능 사용', text: 'random 모듈 안의 randint 함수를 사용하여 1~10 사이 숫자를 뽑습니다.', type: 'blue', badge: 'rand' }
      ]
    }
  ],
  conceptProblems: [
    {
      id: 'py11_c1',
      question: 'Q1. try / except를 사용하는 가장 주된 목적은 무엇인가요?',
      options: [
        '코드를 더 빠르게 실행하기 위해',
        '오류를 완전히 무시하기 위해',
        '오류 발생 시 프로그램이 종료되지 않게 하기 위해',
        '변수 값을 보호하기 위해'
      ],
      answer: '오류 발생 시 프로그램이 종료되지 않게 하기 위해',
      hint: '프로그램이 튕기지 않게 방어하는 역할을 합니다.',
      explanation: '예외 처리는 비정상적인 종료를 막고 프로그램의 실행 흐름을 유지하기 위해 사용합니다.',
      type: 'concept'
    },
    {
      id: 'py11_c2',
      question: 'Q2. 다음 코드에서 발생할 수 있는 오류 종류는?\nx = int("abc")',
      options: ['ZeroDivisionError', 'FileNotFoundError', 'ValueError', 'TypeError'],
      answer: 'ValueError',
      hint: '값이 올바르지 않을 때 발생하는 에러입니다.',
      explanation: 'int() 함수에 숫자가 아닌 문자열을 전달하면 값의 오류인 ValueError가 발생합니다.',
      type: 'concept'
    },
    {
      id: 'py11_c3',
      question: 'Q3. 모듈을 사용하기 위해 가장 먼저 해야 할 일은 무엇인가요?',
      options: ['모듈을 실행한다', '모듈을 다운로드한다', 'import 문으로 불러온다', '모듈 이름을 출력한다'],
      answer: 'import 문으로 불러온다',
      hint: '다른 방에 있는 도구를 내 방으로 가지고 오는 것과 같습니다.',
      explanation: 'import 키워드를 사용하여 사용할 모듈을 선언해야 내부 함수를 사용할 수 있습니다.',
      type: 'concept'
    },
    {
      id: 'py11_c4',
      question: 'Q4. 다음 중 random 모듈의 주요 기능으로 올바른 것은?',
      options: ['파일 읽기', '문자열 변환', '난수 생성', '오류 처리'],
      answer: '난수 생성',
      hint: 'random은 "무작위"라는 뜻입니다.',
      explanation: 'random 모듈은 임의의 숫자를 생성하거나 리스트에서 무작위로 요소를 선택하는 기능을 제공합니다.',
      type: 'concept'
    }
  ],
  codingProblems: [
    {
      id: 'py11_cp1',
      question: '문제 1. 숫자를 입력받아 출력하되, 숫자가 아니면 "숫자를 입력하세요"를 출력하는 코드를 작성하시오.',
      answer: 'try:\n    x = int(input())\n    print(x)\nexcept ValueError:\n    print("숫자를 입력하세요")',
      hint: 'try: 안에서 int(input())을 시도하고 except ValueError: 블록을 만드세요.',
      type: 'coding',
      exampleInput: 'hello',
      exampleOutput: '숫자를 입력하세요'
    },
    {
      id: 'py11_cp2',
      question: '문제 2. data.txt 파일을 열어 내용을 출력하되, 파일이 없으면 "파일이 없습니다"를 출력하시오.',
      answer: 'try:\n    with open("data.txt", "r") as f:\n        print(f.read())\nexcept FileNotFoundError:\n    print("파일이 없습니다")',
      hint: 'FileNotFoundError 예외를 처리하세요.',
      type: 'coding',
      exampleOutput: '파일이 없습니다'
    },
    {
      id: 'py11_cp3',
      question: '문제 3. random 모듈을 사용하여 1부터 6 사이의 랜덤 숫자 하나를 출력하시오.',
      answer: 'import random\nprint(random.randint(1, 6))',
      hint: 'import random을 먼저 적고, random.randint()를 사용하세요.',
      type: 'coding'
    }
  ]
};
