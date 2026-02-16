
import { Lesson } from './types';

export const py_basic_stage6: Lesson = {
  id: 'py6',
  title: 'STEP 6. 자료구조 (list / tuple / dict / set)',
  description: '여러 개의 데이터를 한 번에 묶어서 관리하고 효율적으로 처리하는 법을 배웁니다.',
  category: 'language',
  status: 'locked',
  pages: [
    {
      id: 'py6_p1',
      title: '1. 리스트 (list)',
      content:
        '리스트는 여러 값을 순서대로 저장하는 가장 대표적인 자료구조입니다. 대괄호 []를 사용하며, 저장된 값을 자유롭게 변경하거나 추가할 수 있습니다.',
      code: 'nums = [1, 2, 3]\nnums.append(4)\nprint(nums)',
      exampleOutput: '[1, 2, 3, 4]',
      traceFlow: [0, 1, 2],
      variableHistory: [
        { nums: [1, 2, 3] },
        { nums: [1, 2, 3, 4] },
        { nums: [1, 2, 3, 4] }
      ],
      explanations: [
        { id: 'ex6_1', codeLine: 0, title: '리스트 생성', text: '1, 2, 3을 순서대로 담은 리스트를 만듭니다.', type: 'blue', badge: '1' },
        { id: 'ex6_2', codeLine: 1, title: '요소 추가', text: 'append()를 사용하여 리스트 끝에 4를 추가합니다.', type: 'orange', badge: '2' },
        { id: 'ex6_3', codeLine: 2, title: '전체 출력', text: '[1, 2, 3, 4]가 출력됩니다.', type: 'green', badge: '3' }
      ]
    },

    {
      id: 'py6_p2',
      title: '2. 튜플 & 딕셔너리',
      content:
        '튜플()은 리스트와 비슷하지만 값을 바꿀 수 없고, 딕셔너리{}는 이름(Key)과 값(Value)의 쌍으로 데이터를 저장합니다.',
      code: 'point = (10, 20)\nstudent = {"name": "지니", "age": 17}\nprint(student["name"])',
      exampleOutput: '지니',
      traceFlow: [0, 1, 2],
      variableHistory: [
        { point: [10, 20] },
        { point: [10, 20], student: { name: '지니', age: 17 } },
        { point: [10, 20], student: { name: '지니', age: 17 } }
      ],
      explanations: [
        { id: 'ex6_4', codeLine: 0, title: '튜플 (tuple)', text: '소괄호를 사용하며, 한 번 정하면 값을 수정할 수 없습니다.', type: 'purple', badge: '1' },
        { id: 'ex6_5', codeLine: 1, title: '딕셔너리 (dict)', text: '이름과 나이를 키-값 쌍으로 저장합니다.', type: 'yellow', badge: '2' },
        { id: 'ex6_6', codeLine: 2, title: '값 접근', text: '키인 "name"을 사용하여 "지니"라는 값을 가져옵니다.', type: 'blue', badge: '3' }
      ]
    },

    {
      id: 'py6_p3',
      title: '3. 집합 (set)',
      content:
        '집합은 중복을 허용하지 않고 순서가 없는 자료구조입니다. 여러 번 넣어도 하나만 남으므로 중복 제거에 유용합니다.',
      code: 's = {1, 2, 2, 3}\nprint(s)\nprint(len(s))',
      exampleOutput: '{1, 2, 3}\n3',
      traceFlow: [0, 1, 2],
      variableHistory: [
        { s: [1, 2, 3] },
        { s: [1, 2, 3] },
        { s: [1, 2, 3] }
      ],
      explanations: [
        { id: 'ex6_7', codeLine: 0, title: '집합 생성', text: '중괄호를 사용합니다. 2를 두 번 넣었지만 실제로는 하나만 저장됩니다.', type: 'orange', badge: '1' },
        { id: 'ex6_8', codeLine: 1, title: '중복 제거 확인', text: '{1, 2, 3}이 출력됩니다 (순서는 다를 수 있음).', type: 'green', badge: '2' },
        { id: 'ex6_9', codeLine: 2, title: '길이 확인', text: '요소의 개수인 3이 출력됩니다.', type: 'blue', badge: '3' }
      ]
    },

    {
      id: 'py6_p4',
      title: '4. in 연산자',
      content:
        'in 연산자는 값이 리스트, 튜플, 문자열 등 자료구조 안에 포함되어 있는지를 확인합니다. 결과는 참(True) 또는 거짓(False)으로 나타납니다.',
      code: 'nums = [1, 2, 3]\nprint(3 in nums)\nprint(5 in nums)\n\ns = "apple"\nprint("a" in s)',
      exampleOutput: 'True\nFalse\nTrue',
      traceFlow: [0, 1, 2, 4, 5],
      variableHistory: [
        { nums: [1, 2, 3] },
        { nums: [1, 2, 3] },
        { nums: [1, 2, 3] },
        { s: 'apple' },
        { s: 'apple' }
      ],
      explanations: [
        { id: 'ex6_10', codeLine: 1, title: '리스트 확인', text: '3이 nums 리스트 안에 있으므로 True를 반환합니다.', type: 'blue', badge: 'in' },
        { id: 'ex6_11', codeLine: 2, title: '미포함 확인', text: '5는 리스트에 없으므로 False를 반환합니다.', type: 'red', badge: 'X' },
        { id: 'ex6_12', codeLine: 5, title: '문자열 확인', text: '"a"라는 글자가 "apple" 안에 들어있는지 확인하여 True를 반환합니다.', type: 'green', badge: 'str' }
      ]
    },

    {
      id: 'py6_p5_extra',
      title: '5. 리스트 vs 문자열 (수정 가능성)',
      content:
        '리스트와 문자열은 모두 순서가 있고 인덱스를 사용할 수 있다는 공통점이 있습니다. 하지만 결정적인 차이가 있습니다.\n- 문자열(str): 한 번 정하면 내용을 바꿀 수 없음 (불변)\n- 리스트(list): 인덱스를 통해 내용을 자유롭게 수정 가능 (가변)',
      code: 's = "abc"\n# s[0] = "x"  # 오류 발생!\n\nlst = ["a", "b", "c"]\nlst[0] = "x"\nprint(lst)',
      exampleOutput: '["x", "b", "c"]',
      traceFlow: [0, 3, 4, 5],
      variableHistory: [
        { s: 'abc' },
        { lst: ['a', 'b', 'c'] },
        { lst: ['x', 'b', 'c'] },
        { lst: ['x', 'b', 'c'] }
      ],
      explanations: [
        { id: 'ex6_13', codeLine: 1, title: '문자열 수정 불가', text: '문자열의 일부를 바꾸려고 하면 에러가 발생합니다.', type: 'red', badge: 'X' },
        { id: 'ex6_14', codeLine: 4, title: '리스트 수정 가능', text: '리스트는 인덱스로 접근하여 값을 마음대로 갈아끼울 수 있습니다.', type: 'blue', badge: 'OK' },
        { id: 'ex6_15', codeLine: 5, title: '결과 확인', text: '["x", "b", "c"] 가 출력됩니다.', type: 'green', badge: '1' }
      ]
    }
  ],
  conceptProblems: [
    {
      id: 'py6_c1',
      question: 'Q1. 다음 중 값의 순서가 있고, 값 변경이 가능한 자료구조는?',
      options: ['tuple', 'set', 'list', 'dict'],
      answer: 'list',
      hint: '대괄호 []를 사용하는 자료구조입니다.',
      explanation: 'list는 순서가 유지되며 mutable(변경 가능)한 특징을 가집니다.',
      type: 'concept'
    },
    {
      id: 'py6_c2',
      question: 'Q2. 다음 중 값 변경이 불가능한(immutable) 자료구조는?',
      options: ['list', 'tuple', 'dict', 'set'],
      answer: 'tuple',
      hint: '소괄호 ()를 사용하여 정의합니다.',
      explanation: 'tuple은 한 번 생성되면 내부의 요소를 수정하거나 삭제할 수 없습니다.',
      type: 'concept'
    },
    {
      id: 'py6_c3',
      question: 'Q3. 다음 중 key를 사용하여 값에 접근하는 자료구조는?',
      options: ['list', 'tuple', 'set', 'dict'],
      answer: 'dict',
      hint: '단어장처럼 단어와 뜻이 연결된 구조입니다.',
      explanation: 'dict(딕셔너리)는 Key-Value 쌍으로 데이터를 관리합니다.',
      type: 'concept'
    },
    {
      id: 'py6_c4',
      question: 'Q4. 다음 중 중복된 값을 자동으로 제거하는 자료구조는?',
      options: ['list', 'tuple', 'dict', 'set'],
      answer: 'set',
      hint: '수학의 집합 개념과 동일합니다.',
      explanation: 'set은 유일한 값들만 저장하며 중복을 허용하지 않습니다.',
      type: 'concept'
    },
    {
      id: 'py6_c5',
      question: 'Q5. 다음 중 실행 결과가 True인 것은 무엇인가요?',
      options: ['5 in [1, 2, 3]', '"a" in "bc"', '3 in [1, 2, 3]', '0 in [1, 2, 3]'],
      answer: '3 in [1, 2, 3]',
      hint: '값이 리스트 안에 실제로 들어있는지 확인해보세요.',
      explanation: '3은 [1, 2, 3] 리스트의 요소 중 하나이므로 True가 됩니다.',
      type: 'concept'
    },
    {
      id: 'py6_c6_extra',
      question: 'Q6. 문자열과 리스트의 차이로 올바른 설명은 무엇인가요?',
      options: [
        '둘 다 수정 가능하다',
        '문자열만 수정 가능하다',
        '리스트만 수정 가능하다',
        '둘 다 수정 불가능하다'
      ],
      answer: '리스트만 수정 가능하다',
      hint: '문자열은 불변(Immutable) 객체입니다.',
      explanation: '리스트는 인덱스를 통해 원소를 변경할 수 있지만, 문자열은 생성 후 내용을 변경할 수 없습니다.',
      type: 'concept'
    }
  ],
  codingProblems: [
    {
      id: 'py6_cp1',
      question: '문제 1. 리스트 [3, 1, 4, 1, 5]를 만들고 그 길이를 출력하시오.',
      answer: 'nums = [3, 1, 4, 1, 5]\nprint(len(nums))',
      hint: 'len() 함수를 사용하여 리스트의 요소 개수를 구할 수 있습니다.',
      type: 'coding',
      exampleOutput: '5'
    },
    {
      id: 'py6_cp2',
      question: '문제 2. 딕셔너리를 사용하여 이름(name)은 "지니", 나이(age)는 17을 저장한 후 이름을 출력하시오.',
      answer: 'person = {"name": "지니", "age": 17}\nprint(person["name"])',
      hint: '딕셔너리명["키"] 형식으로 값에 접근하세요.',
      type: 'coding',
      exampleOutput: '지니'
    },
    {
      id: 'py6_cp3',
      question: '문제 3. 숫자 5개를 각각 입력받아 set에 저장한 뒤, 중복을 제거한 원소의 개수를 출력하시오.',
      answer: 's = set()\nfor i in range(5):\n    s.add(int(input()))\nprint(len(s))',
      hint: 'set의 add() 메소드와 반복문을 활용하세요.',
      type: 'coding',
      exampleInput: '1\n2\n2\n3\n3',
      exampleOutput: '3'
    },
    {
      id: 'py6_cp4',
      question: '문제 4. 리스트 [10, 20, 30]을 만들고, 20이 리스트에 있는지 확인하여 결과를 출력하시오.',
      answer: 'nums = [10, 20, 30]\nprint(20 in nums)',
      hint: 'in 연산자를 사용하여 포함 여부를 확인하고 결과를 출력하세요.',
      type: 'coding',
      exampleOutput: 'True'
    },
    {
      id: 'py6_cp5_extra',
      question: '문제 5. 리스트 [10, 20, 30]의 첫 번째 값(인덱스 0)을 100으로 변경한 뒤 리스트 전체를 출력하시오.',
      answer: 'lst = [10, 20, 30]\nlst[0] = 100\nprint(lst)',
      hint: '리스트명[인덱스] = 새로운값 형식을 사용하세요.',
      type: 'coding',
      exampleOutput: '[100, 20, 30]'
    }
  ]
};
