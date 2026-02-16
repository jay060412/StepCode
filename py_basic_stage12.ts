
import { Lesson } from './types';

export const py_basic_stage12: Lesson = {
  id: 'py12',
  title: 'STEP 12. 총 정리 & 종합 평가',
  description: '파이썬 기초 트랙을 마무리하며 전 과정을 복습하고 실력을 점검합니다.',
  category: 'language',
  status: 'locked',
  pages: [
    {
      id: 'py12_p1',
      title: '1. 문법 총 정리 (STEP 1~5)',
      content:
        '지금까지 배운 기초 문법들을 한눈에 정리해봅시다.\n\n- 출력/변수: print(), a = 10\n- 입력/변환: input(), int(), str()\n- 연산자: +, -, *, /, //, %, **\n- 조건문: if, elif, else\n- 반복문: for, while, break, continue',
      code:
        '# 1부터 10 사이의 짝수만 출력하기\nfor i in range(1, 11):\n    if i % 2 == 0:\n        print(f"{i}: 짝수")\n    else:\n        continue',
      exampleOutput:
        '2: 짝수\n4: 짝수\n6: 짝수\n8: 짝수\n10: 짝수',
      traceFlow: [1, 2, 3, 5],
      variableHistory: [
        {},
        { i: 1 },
        { i: 2 },
        { i: 2 },
        { i: 3 }
      ],
      explanations: [
        { id: 'ex12_1', codeLine: 1, title: '반복문', text: '1부터 10까지 숫자를 순회합니다.', type: 'blue', badge: 'for' },
        { id: 'ex12_2', codeLine: 2, title: '조건문', text: '2로 나눈 나머지가 0인지 확인합니다.', type: 'yellow', badge: 'if' },
        { id: 'ex12_3', codeLine: 5, title: '흐름 제어', text: '홀수일 때는 아래 코드를 무시하고 다음 바퀴로 넘어갑니다.', type: 'orange', badge: 'cont' }
      ]
    },
    {
      id: 'py12_p2',
      title: '2. 심화 개념 총 정리 (STEP 6~11)',
      content:
        '데이터를 효율적으로 다루고 관리하는 고급 문법들입니다.\n\n- 자료구조: list, tuple, dict, set\n- 문자열: 인덱싱, 메서드(.upper(), .count())\n- 함수/클래스: def, return, class, __init__, self\n- 입출력/예외: with open(), try-except, import',
      code:
        'class Calc:\n    def add(self, a, b):\n        return a + b\n\ntry:\n    c = Calc()\n    print(c.add(10, 20))\nexcept:\n    print("에러 발생")',
      exampleOutput: '30',
      traceFlow: [0, 1, 4, 5],
      variableHistory: [
        {},
        {},
        { c: 'Calc 인스턴스' },
        { c: 'Calc 인스턴스' }
      ],
      explanations: [
        { id: 'ex12_4', codeLine: 0, title: '클래스', text: '설계도를 정의합니다.', type: 'purple', badge: 'class' },
        { id: 'ex12_5', codeLine: 2, title: '함수(메서드)', text: '값을 반환하는 기능을 구현합니다.', type: 'blue', badge: 'def' },
        { id: 'ex12_6', codeLine: 4, title: '예외 처리', text: '코드 실행 중 발생할 수 있는 에러에 대비합니다.', type: 'red', badge: 'try' }
      ]
    }
  ],
  conceptProblems: [
    {
      id: 'py12_c1',
      question: 'Q1. input() 함수의 반환 자료형은 무엇인가요?',
      options: ['int', 'float', 'str', 'bool'],
      answer: 'str',
      hint: '사용자가 숫자를 입력해도 결과는 문자열입니다.',
      explanation: 'input()은 항상 문자열(str) 타입을 반환합니다.',
      type: 'concept'
    },
    {
      id: 'py12_c2',
      question: 'Q2. 다음 중 조건식으로 사용할 수 없는 것은?',
      options: ['x > 3', 'x == 10', 'True', 'x = 5'],
      answer: 'x = 5',
      hint: '= 는 대입이고 == 이 비교입니다.',
      explanation: 'x = 5는 변수에 값을 할당하는 명령문이므로 참/거짓을 판별하는 조건식으로 쓸 수 없습니다.',
      type: 'concept'
    },
    {
      id: 'py12_c3',
      question: 'Q3. 반복 횟수가 정해지지 않고 특정 조건 동안 반복할 때 적절한 문법은?',
      options: ['if', 'for', 'while', 'break'],
      answer: 'while',
      hint: '조건이 True인 동안 계속 도는 문법입니다.',
      explanation: 'while 문은 주어진 조건식이 참인 동안 무한히 반복을 수행합니다.',
      type: 'concept'
    },
    {
      id: 'py12_c4',
      question: 'Q4. 다음 중 중복된 값을 허용하지 않는 자료구조는?',
      options: ['list', 'tuple', 'dict', 'set'],
      answer: 'set',
      hint: '수학의 집합 개념을 떠올려보세요.',
      explanation: 'set은 요소의 중복을 허용하지 않는 특징을 가집니다.',
      type: 'concept'
    },
    {
      id: 'py12_c5',
      question: 'Q5. 함수에서 return의 역할로 가장 올바른 것은?',
      options: ['값을 출력한다', '함수를 반복 실행한다', '함수의 결과를 반환하고 종료한다', '변수를 초기화한다'],
      answer: '함수의 결과를 반환하고 종료한다',
      hint: '함수가 나에게 돌려주는 결과값입니다.',
      explanation: 'return은 함수의 실행 결과를 호출부로 전달하며 해당 함수를 끝냅니다.',
      type: 'concept'
    },
    {
      id: 'py12_c6',
      question: 'Q6. 객체가 생성될 때 자동으로 실행되는 메서드는?',
      options: ['start', 'create', '__init__', 'self'],
      answer: '__init__',
      hint: '언더바 두 개로 시작합니다.',
      explanation: '__init__은 인스턴스 초기화를 위해 자동 호출되는 특수 메서드입니다.',
      type: 'concept'
    },
    {
      id: 'py12_c7',
      question: 'Q7. with 문을 사용하는 가장 큰 이유는 무엇인가요?',
      options: ['파일을 빠르게 읽기 위해', '파일을 자동으로 닫기 위해', '파일 이름을 바꾸기 위해', '오류를 숨기기 위해'],
      answer: '파일을 자동으로 닫기 위해',
      hint: 'close()를 직접 쓸 필요가 없게 해줍니다.',
      explanation: 'with 구문은 컨텍스트 매니저를 통해 리소스를 자동으로 해제(close)해줍니다.',
      type: 'concept'
    },
    {
      id: 'py12_c8',
      question: 'Q8. 다음 중 try / except를 사용하는 목적은?',
      options: ['코드를 줄이기 위해', '오류를 발생시키기 위해', '오류로 인한 프로그램 종료를 막기 위해', '변수를 보호하기 위해'],
      answer: '오류로 인한 프로그램 종료를 막기 위해',
      hint: '프로그램이 비정상적으로 멈추는 것을 방지합니다.',
      explanation: '예외 처리는 에러 상황에서도 프로그램이 안정적으로 동작하게 돕습니다.',
      type: 'concept'
    }
  ],
  codingProblems: [
    {
      id: 'py12_cp1',
      question: '문제 1. 정수를 입력받아 짝수이면 "EVEN", 홀수이면 "ODD"를 출력하시오.',
      answer: 'n = int(input())\nif n % 2 == 0:\n    print("EVEN")\nelse:\n    print("ODD")',
      hint: '입력받은 값을 숫자로 바꾸고 % 2 연산을 사용하세요.',
      type: 'coding',
      exampleInput: '15',
      exampleOutput: 'ODD'
    },
    {
      id: 'py12_cp2',
      question: '문제 2. 리스트(nums)를 매개변수로 받아 그 평균을 반환하는 함수 avg를 작성하시오.',
      answer: 'def avg(nums):\n    return sum(nums) / len(nums)',
      hint: 'sum()으로 합계를 구하고 len()으로 나누세요.',
      type: 'coding'
    },
    {
      id: 'py12_cp3',
      question: '문제 3. Student 클래스를 만드시오.\n- 생성자에서 name, score를 저장한다.\n- score가 60 이상이면 "PASS", 아니면 "FAIL"을 출력하는 result 메서드를 작성한다.',
      answer: 'class Student:\n    def __init__(self, name, score):\n        self.name = name\n        self.score = score\n\n    def result(self):\n        if self.score >= 60:\n            print("PASS")\n        else:\n            print("FAIL")\n\ns = Student("지니", 80)\ns.result()',
      hint: 'self 키워드와 if문을 적절히 사용하세요.',
      type: 'coding',
      exampleOutput: 'PASS'
    },
    {
      id: 'py12_cp4',
      question: '문제 4. numbers.txt 파일에 1부터 5까지의 숫자를 한 줄씩 저장하고, 다시 그 파일을 읽어 내용을 화면에 출력하시오.',
      answer: 'with open("numbers.txt", "w") as f:\n    for i in range(1, 6):\n        f.write(str(i) + "\\n")\n\nwith open("numbers.txt", "r") as f:\n    print(f.read())',
      hint: 'w 모드로 쓰고 r 모드로 읽으세요.',
      type: 'coding'
    },
    {
      id: 'py12_cp5',
      question: '문제 5. 숫자를 입력받아 출력하되, 숫자가 아니면 "잘못된 입력"을 출력하는 코드를 작성하시오.',
      answer: 'try:\n    x = int(input())\n    print(x)\nexcept ValueError:\n    print("잘못된 입력")',
      hint: 'ValueError 예외를 처리하는 try-except 문을 사용하세요.',
      type: 'coding',
      exampleInput: 'abc',
      exampleOutput: '잘못된 입력'
    }
  ]
};
