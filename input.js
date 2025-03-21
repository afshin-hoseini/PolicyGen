export const input = {
  id: 1,
  version: '1.0.0',
  name: 'Test',
  price: {

    $run: {

      $: 'isOlderThan18',
      $params: {
      },

      // No then -> show the value
      $then: {
        $case: [
          { $e: true, $v: 100 },
          { $e: false, $v: 200 },
          {
            $e: 'hello', $v: {
              $run: {
                $: 'fetchDbValue'
              }
            }
          },
          { $gt: 15, $v: 300 },
          { $lt: 15, $v: 400 },
          { $eval: 'isThatThing', $v: 'That thing' },
          { $else: 'No match' }
        ]
      }
    }
  }
};
